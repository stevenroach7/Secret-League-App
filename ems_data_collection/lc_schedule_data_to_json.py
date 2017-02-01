import requests
from bs4 import BeautifulSoup
import time
import json

# Created by Steven Roach, 1/26/2017
# Sends http requests to collect data from the EMS.macalester.edu page and converts that data to a JSON format.


def create_event_dictionaries(div_ids, date_string):
    """Takes a list of EMS div id's representing events and a date_string representing the date of
    those events and creates a list of dictionaries (one for each event) with a value for EventID,
    RoomID, and date_string."""
    events = []
    for div_id in div_ids:
        event = {}
        div_id_split = div_id.split(":")
        event['EventID'] = div_id_split[0][1:]
        event['RoomID'] = div_id_split[1]
        event['date_string'] = date_string
        events.append(event)
    return events

def filter_events(events, room_ids):
    """Takes a list of event dictionaries and a list of room_ids, returns a new list containing only the event dictionaries whose RoomID is in room_ids."""
    valid_events = []
    for event in events:
        if event['RoomID'] in room_ids:
            valid_events.append(event)
    return valid_events


def construct_events_by_date_dictionary(div_ids_dictionary, valid_room_ids):
    """Takes a dictionary of div_id_lists with the key being the date of those events and a list
    of valid room ID's and returns a dictionary with the key being the date and the value being a list
    of dictionaries each representing an event containing the EventID, RoomID, and date_string."""
    # Create dictionary to store event data with the key being a date_string and value
    # being a list of event dictionaries.
    events_by_date_dictionary = {}

    for date_string, div_ids in div_ids_dictionary.items():
        events = create_event_dictionaries(div_ids, date_string)
        valid_events = filter_events(events, valid_room_ids)  # Discard events from rooms we do not want.
        events_by_date_dictionary[date_string] = valid_events
    return events_by_date_dictionary

def insert_into_http_form_data_string(http_form_data_string, event_id, room_id, date_string):
    """Takes a http_form_data_string string, an EventID, RoomID, and date_string and
    returns the http_form_data_string with the EventID, RoomID, and BookDate values replaced by the inputs."""
    string_parts = []
    split0 = http_form_data_string.split('EventID%22%3A%22', 1)
    string_parts.append(split0[0])
    string_parts.append('EventID%22%3A%22')

    string_parts.append(event_id)

    split1 = split0[1].split('%22%2C%22', 1)
    string_parts.append('%22%2C%22')

    split2 = split1[1].split('RoomID%22%3A%22', 1)
    string_parts.append(split2[0])
    string_parts.append('RoomID%22%3A%22')

    string_parts.append(room_id)

    split3 = split2[1].split('%22%2C%22', 1)
    string_parts.append('%22%2C%22')

    split4 = split3[1].split('BookDate%22%3A%22', 1)
    string_parts.append(split4[0])
    string_parts.append('BookDate%22%3A%22')

    string_parts.append(date_string)

    split5 = split4[1].split('%22%2C%22', 1)
    string_parts.append('%22%2C%22')

    string_parts.append(split5[1])

    return ''.join(string_parts)

def get_event_data_http_response(event_id, room_id, date_string, cookie_string, http_form_data_string):
    """Takes an EventID, RoomID, date_string, cookie_string, and http_form_data_string and constructs an http post
    request to send to ems.macalester.edu according to the inputs. Returns the text of the http response."""
    headers = {'Accept': '*/*',
               'Accept-Encoding': 'gzip, deflate',
               'Accept-Language': 'en-US,en;q=0.8',
               'Connection': 'keep-alive',
               'Content-Length': '10993',
               'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
               'Cookie': cookie_string,
               'Host': 'ems.macalester.edu',
               'Origin': 'http://ems.macalester.edu',
               'Referer': 'http://ems.macalester.edu/EMSWebClient/ReservationBook.aspx',
               'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.95 Safari/537.36'
               }

    edited_http_form_data_string = insert_into_http_form_data_string(http_form_data_string, event_id, room_id, date_string)

    r = requests.post('http://ems.macalester.edu/EMSWebClient/ReservationBook.aspx', headers=headers, data=edited_http_form_data_string)
    return r.text

def convert_html_to_dictionary(html_table):
    """Takes an html table string and returns the data in dictionary format.
    Adapted from http://stackoverflow.com/questions/11901846/beautifulsoup-a-dictionary-from-an-html-table"""
    bs = BeautifulSoup(html_table, 'html.parser')

    results = {}
    for row in bs.findAll('tr'):
        aux = row.findAll('td')
        results[aux[0].string] = aux[1].string
    return results

def construct_event_responses_by_date_dictionary(events_by_date_dictionary, cookie_string, http_form_data_string):
    """Takes an events_by_date_dictionary, a cookie_string, and a http_form_data_string and returns a dictionary with the key being
    a date_string and the value being a list of http response text strings (one for each event)."""
    event_responses_by_date_dictionary = {}
    for date_string, events in events_by_date_dictionary.items():
        event_responses = []
        for event in events:
            event_response = get_event_data_http_response(event['EventID'], event['RoomID'], event['date_string'], cookie_string, http_form_data_string)
            time.sleep(1)  # Wait a second before continuing to not put too much strain of EMS servers..
            event_response_split = event_response.split('<table>', 1)
            if len(event_response_split) == 2:  # If response contains '<table'
                event_response_html = '<table>' + event_response_split[1]  # add table tag to rest of string.
            else:  # Response is not useful.
                event_response_html = ""
            event_response_dictionary = convert_html_to_dictionary(event_response_html)
            event_response_dictionary['room_id'] = event['RoomID']  # Add room_id string as we will need it later to identify the exact room.
            event_responses.append(event_response_dictionary)
        event_responses_by_date_dictionary[date_string] = event_responses
    return event_responses_by_date_dictionary


# Create JSON file

def convert_date_string_to_sl_date_string(date_string):
    """Takes a date_string in html_response format and trims characters to return a date_string in Secret League
    Database format (string of 8 numbers)."""
    sl_date_string_split = date_string.split('%2F')

    if len(sl_date_string_split) != 3:  # Check that string split in three parts.
        return None

    for i in range(2):  # Add zero to month and date parts if neccessary.
        if len(sl_date_string_split[i]) != 2:
            sl_date_string_split[i] = '0' + sl_date_string_split[i]

    sl_date_string = ''.join(sl_date_string_split)
    return sl_date_string

def convert_room_id_to_place_string(room_id):
    """Takes a room_id value and returns the place_string for that room_id."""
    room_id_to_place_string_mapping = {
        '3478': 'alumniGym',
        '3482': 'fieldHouseCourt1',
        '3483': 'fieldHouseCourt2',
        '3484': 'fieldHouseCourt3',
        '3485': 'fieldHouseCourt4',
        '3488': 'fieldHouseTrack',
        '3486': 'rbCourt1',
        '3487': 'rbCourt2',
        '3473': 'studio1',
        '3474': 'studio2'
    }
    return room_id_to_place_string_mapping[room_id]

def convert_place_string_to_display_string(place_string):
    """Takes a place_string and returns the display_string for that place_string."""
    place_string_to_display_string_mapping = {
        'alumniGym' : 'Alumni Gym',
        'fieldHouseCourt1' : 'Court 1',
        'fieldHouseCourt2' : 'Court 2',
        'fieldHouseCourt3' : 'Court 3',
        'fieldHouseCourt4' : 'Court 4',
        'fieldHouseTrack' : 'Track',
        'rbCourt1' : 'Squash 1',
        'rbCourt2' : 'Squash 2',
        'studio1' : 'Studio 1',
        'studio2' : 'Studio 2',
    }
    return place_string_to_display_string_mapping[place_string]

def convert_hours_to_seconds(hours):
    """Takes a value in hours and returns that value in seconds."""
    return int(hours * 3600)

def convert_minutes_to_seconds(minutes):
    """Takes a value in minutes and returns that value in seconds."""
    return int(minutes * 60)

def convert_time_to_seconds(time_string):
    """Takes a time_string (i.e. 6:15 PM and returns that time in seconds since midnight."""
    time_string_split0 = time_string.split(':', 1)

    if len(time_string_split0) != 2:
        return None

    hours = int(time_string_split0[0])  # Resassign hours to 0 when hour starts in 12 hour.
    if hours == 12:
        hours = 0

    time_string_split1 = time_string_split0[1].split(' ', 2)
    minutes = int(time_string_split1[0])

    seconds = convert_hours_to_seconds(hours) + convert_minutes_to_seconds(minutes)

    if time_string_split1[1] == 'PM':
        seconds += convert_hours_to_seconds(12)
    return seconds

def get_starting_time_string(full_time_string):
    """Takes a full_time_string (i.e. '6:15 PM To 7:45 PM (CST)') and returns the part of the string
    referring to the starting time."""
    time_string_split = full_time_string.split(' To ')
    start_time = time_string_split[0]
    return start_time

def get_ending_time_string(full_time_string):
    """Takes a full_time_string (i.e. '6:15 PM To 7:45 PM (CST)') and returns the part of the string
    referring to the ending time."""
    time_string_split0 = full_time_string.split(' To ')
    time_string_split1 = time_string_split0[1].split(' (')
    end_time = time_string_split1[0]
    return end_time


def add_event_to_dictionary(event_name, start_time, end_time, date_string, place_string, schedule_dictionary):
    """Takes 5 strings representing event details and a dictionary for those details to be added to.
    Returns the dictionary with a new event added as specified by the first 5 event detail inputs."""
    schedule_dictionary[place_string][start_time] = {
        'eventName': event_name,
        'startTime': start_time,
        'endTime': end_time,
        'dateString': date_string,
        'place': convert_place_string_to_display_string(place_string)
    }
    return schedule_dictionary

def create_json_file(date_string, event_response_dictionaries):
    """Takes a date_string and a dictionary of events for that date and creates a JSON file to be added
    to the Secret League Firebase Database."""

    schedule_dictionary = {
        'alumniGym' : {},
        'fieldHouseCourt1' : {},
        'fieldHouseCourt2' : {},
        'fieldHouseCourt3' : {},
        'fieldHouseCourt4' : {},
        'fieldHouseTrack' : {},
        'rbCourt1' : {},
        'rbCourt2' : {},
        'studio1' : {},
        'studio2' : {}
    }

    for event_response_dictionary in event_response_dictionaries:
        sl_date_string = 'blank_file'  # initialize name as blank file so that if the json file is empty, the title will indicate so.

        if len(event_response_dictionary.items()) > 1:
            event_name = event_response_dictionary['Event Name:']
            start_time = convert_time_to_seconds(get_starting_time_string(event_response_dictionary['Reserved:']))
            end_time = convert_time_to_seconds(get_ending_time_string(event_response_dictionary['Reserved:']))
            sl_date_string = convert_date_string_to_sl_date_string(date_string)
            place_string = convert_room_id_to_place_string(event_response_dictionary['room_id'])

            schedule_dictionary = add_event_to_dictionary(event_name, start_time, end_time, sl_date_string, place_string, schedule_dictionary)


    file_name = 'schedule_' + sl_date_string + '.json'
    with open(file_name, 'w') as outfile:
        json.dump(schedule_dictionary, outfile)


div_ids_dictionary = {
    # '1%2F25%2F2017': ["E2462388:3478:140346", "E2462388:3479:140346", "E2462388:3480:140346", "E2467058:3490:140684", "E2440143:3481:139732", "E2462783:3481:140372", "E2462786:3481:140373", "E2440143:3482:139732", "E2462783:3482:140372", "E2462786:3482:140373", "E2440143:3483:139732", "E2462783:3483:140372", "E2462786:3483:140373", "E2440143:3484:139732", "E2462783:3484:140372", "E2462786:3484:140373", "E2440143:3485:139732", "E2462783:3485:140372", "E2462786:3485:140373", "E2440143:3488:139732", "E2462783:3488:140372", "E2462786:3488:140373", "E2439715:3473:139664", "E2439744:3473:139665", "E2439773:3473:139666", "E2440115:3473:139727", "E2439552:3474:139610", "E2439907:3474:139674", "E2439938:3474:139677", "E2401627:3472:136327", "E2440116:3472:139728", "E2440143:3486:139732", "E2462783:3486:140372", "E2462786:3486:140373", "E2440143:3487:139732", "E2462783:3487:140372", "E2462786:3487:140373"]
    # '1%2F26%2F2017': ["E2464815:3478:140538", "E2464905:3478:140569", "E2464815:3479:140538", "E2464905:3479:140569", "E2464815:3480:140538", "E2464905:3480:140569", "E2467057:3490:140683", "E2460980:3493:140243", "E2440122:3481:139729", "E2462793:3481:140374", "E2462794:3481:140375", "E2440122:3482:139729", "E2462793:3482:140374", "E2462794:3482:140375", "E2440122:3483:139729", "E2462793:3483:140374", "E2462794:3483:140375", "E2440122:3484:139729", "E2462793:3484:140374", "E2462794:3484:140375", "E2440122:3485:139729", "E2462793:3485:140374", "E2462794:3485:140375", "E2440122:3488:139729", "E2462793:3488:140374", "E2462794:3488:140375", "E2439803:3473:139667", "E2439832:3473:139668", "E2439876:3473:139670", "E2463803:3473:140434", "E2464126:3473:140461", "E2400575:3474:136156", "E2439986:3474:139696", "E2436545:3472:138968", "E2440122:3486:139729", "E2462793:3486:140374", "E2462794:3486:140375", "E2440122:3487:139729", "E2462793:3487:140374", "E2462794:3487:140375", "E2468547:3491:140751"],
    # '1%2F27%2F2017': ["E2464816:3478:140539", "E2464817:3478:140540", "E2464816:3479:140539", "E2464817:3479:140540", "E2464816:3480:140539", "E2464817:3480:140540", "E2472764:3490:140982", "E2462784:3481:140372", "E2462784:3482:140372", "E2462784:3483:140372", "E2462784:3484:140372", "E2462784:3485:140372", "E2462784:3488:140372", "E2461786:3473:140307", "E2439613:3474:139613", "E2462350:3474:140343", "E2462784:3486:140372", "E2462784:3487:140372"],
    # '1%2F28%2F2017': ["E2376830:3481:134974", "E2376830:3482:134974", "E2376830:3483:134974", "E2376830:3484:134974", "E2376830:3485:134974", "E2376830:3488:134974", "E2471491:3473:140899", "E2472739:3473:140957", "E2348893:3472:132353", "E2376833:3472:134974", "E2376830:3486:134974", "E2376830:3487:134974", "E2376842:3477:134982"],
    # '1%2F29%2F2017': ["E2464906:3478:140569", "E2472789:3478:140998", "E2464906:3479:140569", "E2472789:3479:140998", "E2464906:3480:140569", "E2472789:3480:140998", "E2376831:3481:134974", "E2468409:3481:140721", "E2376831:3482:134974", "E2468409:3482:140721", "E2376831:3483:134974", "E2468409:3483:140721", "E2376831:3484:134974", "E2468409:3484:140721", "E2376831:3485:134974", "E2468409:3485:140721", "E2376831:3488:134974", "E2468409:3488:140721", "E2461801:3473:140308", "E2466911:3473:140661", "E2467118:3473:140692", "E2376832:3472:134974", "E2376831:3486:134974", "E2468409:3486:140721", "E2376831:3487:134974", "E2468409:3487:140721"],
    # '1%2F30%2F2017': ["E2468520:3478:140738", "E2468520:3479:140738", "E2468520:3480:140738", "E2462365:3493:140344", "E2440130:3481:139730", "E2462795:3481:140376", "E2462797:3481:140377", "E2440130:3482:139730", "E2462795:3482:140376", "E2462797:3482:140377", "E2440130:3483:139730", "E2462795:3483:140376", "E2462797:3483:140377", "E2440130:3484:139730", "E2462795:3484:140376", "E2462797:3484:140377", "E2440130:3485:139730", "E2462795:3485:140376", "E2462797:3485:140377", "E2440130:3488:139730", "E2462795:3488:140376", "E2462797:3488:140377", "E2439700:3473:139663", "E2439716:3473:139664", "E2439745:3473:139665", "E2439774:3473:139666", "E2439860:3473:139669", "E2460814:3473:140212", "E2462405:3473:140349", "E2439598:3474:139612", "E2439908:3474:139674", "E2439939:3474:139677", "E2462391:3474:140348", "E2464106:3474:140459", "E2440130:3486:139730", "E2462795:3486:140376", "E2462797:3486:140377", "E2440130:3487:139730", "E2462795:3487:140376", "E2462797:3487:140377"],
    # '1%2F31%2F2017': ["E2462382:3478:140345", "E2464907:3478:140569", "E2468521:3478:140739", "E2462382:3479:140345", "E2464907:3479:140569", "E2468521:3479:140739", "E2462382:3480:140345", "E2464907:3480:140569", "E2468521:3480:140739", "E2472676:3490:140930", "E2440137:3481:139731", "E2462776:3481:140371", "E2462785:3481:140372", "E2440137:3482:139731", "E2462776:3482:140371", "E2462785:3482:140372", "E2440137:3483:139731", "E2462776:3483:140371", "E2462785:3483:140372", "E2440137:3484:139731", "E2462776:3484:140371", "E2462785:3484:140372", "E2440137:3485:139731", "E2462776:3485:140371", "E2462785:3485:140372", "E2440137:3488:139731", "E2462776:3488:140371", "E2462785:3488:140372", "E2439804:3473:139667", "E2439833:3473:139668", "E2439877:3473:139670", "E2440015:3473:139698", "E2460828:3473:140213", "E2463804:3473:140434", "E2464244:3473:140492", "E2439987:3474:139696", "E2461071:3474:140264", "E2464230:3474:140491", "E2466048:3474:140623", "E2466061:3474:140624", "E2440044:3472:139708", "E2471472:3472:140894", "E2440137:3486:139731", "E2462776:3486:140371", "E2462785:3486:140372", "E2440137:3487:139731", "E2462776:3487:140371", "E2462785:3487:140372"],
    # '2%2F01%2F2017': ["E2468522:3478:140740", "E2468522:3479:140740", "E2468522:3480:140740", "E2440144:3481:139732", "E2462787:3481:140373", "E2462801:3481:140379", "E2462802:3481:140380", "E2462803:3481:140381", "E2440144:3482:139732", "E2462787:3482:140373", "E2462801:3482:140379", "E2462802:3482:140380", "E2462803:3482:140381", "E2440144:3483:139732", "E2462787:3483:140373", "E2462801:3483:140379", "E2462802:3483:140380", "E2462803:3483:140381", "E2440144:3484:139732", "E2462787:3484:140373", "E2462801:3484:140379", "E2462802:3484:140380", "E2462803:3484:140381", "E2440144:3485:139732", "E2462787:3485:140373", "E2462801:3485:140379", "E2462802:3485:140380", "E2462803:3485:140381", "E2440144:3488:139732", "E2462787:3488:140373", "E2462801:3488:140379", "E2462802:3488:140380", "E2462803:3488:140381", "E2439717:3473:139664", "E2439746:3473:139665", "E2439775:3473:139666", "E2460843:3473:140215", "E2460857:3473:140216", "E2461099:3473:140266", "E2466086:3473:140626", "E2439553:3474:139610", "E2439909:3474:139674", "E2439940:3474:139677", "E2460871:3474:140217", "E2466074:3474:140625", "E2440144:3486:139732", "E2462787:3486:140373", "E2462801:3486:140379", "E2462802:3486:140380", "E2462803:3486:140381", "E2440144:3487:139732", "E2462787:3487:140373", "E2462801:3487:140379", "E2462802:3487:140380", "E2462803:3487:140381"],
    # '2%2F02%2F2017': ["E2464908:3478:140569", "E2468523:3478:140741", "E2472790:3478:140999", "E2464908:3479:140569", "E2468523:3479:140741", "E2472790:3479:140999", "E2464908:3480:140569", "E2468523:3480:140741", "E2472790:3480:140999", "E2437647:3475:139351", "E2440123:3481:139729", "E2462804:3481:140382", "E2462805:3481:140383", "E2462806:3481:140384", "E2462807:3481:140385", "E2440123:3482:139729", "E2462804:3482:140382", "E2462805:3482:140383", "E2462806:3482:140384", "E2462807:3482:140385", "E2440123:3483:139729", "E2462804:3483:140382", "E2462805:3483:140383", "E2462806:3483:140384", "E2462807:3483:140385", "E2440123:3484:139729", "E2462804:3484:140382", "E2462805:3484:140383", "E2462806:3484:140384", "E2462807:3484:140385", "E2440123:3485:139729", "E2462804:3485:140382", "E2462805:3485:140383", "E2462806:3485:140384", "E2462807:3485:140385", "E2440123:3488:139729", "E2462804:3488:140382", "E2462805:3488:140383", "E2462806:3488:140384", "E2462807:3488:140385", "E2439805:3473:139667", "E2439834:3473:139668", "E2439878:3473:139670", "E2461112:3473:140267", "E2461126:3473:140268", "E2461140:3473:140269", "E2463805:3473:140434", "E2464127:3473:140461", "E2400576:3474:136156", "E2439988:3474:139696", "E2466087:3474:140627", "E2436546:3472:138968", "E2472858:3472:141025", "E2440123:3486:139729", "E2462804:3486:140382", "E2462805:3486:140383", "E2462806:3486:140384", "E2462807:3486:140385", "E2440123:3487:139729", "E2462804:3487:140382", "E2462805:3487:140383", "E2462806:3487:140384", "E2462807:3487:140385"],
    '2%2F03%2F2017': ["E2468524:3478:140742", "E2468525:3478:140743", "E2468524:3479:140742", "E2468525:3479:140743", "E2468524:3480:140742", "E2468525:3480:140743", "E2351800:3481:133311", "E2351800:3482:133311", "E2351800:3483:133311", "E2351800:3484:133311", "E2351800:3485:133311", "E2351800:3488:133311", "E2460899:3473:140219", "E2461787:3473:140307", "E2468562:3473:140753", "E2439614:3474:139613", "E2462351:3474:140343", "E2466099:3474:140628", "E2440117:3472:139728", "E2351800:3486:133311", "E2351800:3487:133311"]
}

valid_room_ids = ['3478', '3482', '3483', '3484', '3485', '3488', '3473', '3474', '3486', '3487']

cookie_string = "badprotocol=-10000; usid=To6gBnOaxgYErwFxKwMi3g__; _ga=GA1.2.151501574.1475766890; ASP.NET_SessionId=mtarlv55ov3352453ef1ep2z; EMSWCCookie=email=Trier&domain="

http_form_data_string = "SwapBookingsMessage=Are%20you%20sure%20you%20want%20to%20swap%20the%20Rooms%20on%20these%20two%20Bookings%3F&BuildingDropdownLabelID=ctl00_pc_buildingDropLabel&BuildingTitleSingular=Building&AreaTitleSingular=Area&ViewTitleSingular=View&BookContainerID=ctl00_pc_bookData&HeaderContainerID=ctl00_pc_bookHeaderContainer&RoomsContainerID=ctl00_pc_rRC&PagingContainerID=ctl00_pc_pageCountContainer&FeaturesListID=ctl00_pc_bookOptionsPopup_toolTipFieldsBox&RoomInfoHeader=Room%20Info&CopyBookingHeader=Copy%20Booking&ChangeStatusHeader=Change%20Status&__EVENTTARGET=&__EVENTARGUMENT=&__VIEWSTATE=%2FwEPDwUKMTI3ODI3ODA5NmQYAQUeX19Db250cm9sc1JlcXVpcmVQb3N0QmFja0tleV9fFigFCGN0bDAwJG1NBRxjdGwwMCRwYyRsb2NEcm9wJGxjbkRyb3AkREREBRljdGwwMCRwYyR2aWV3VHlwZURyb3AkREREBRljdGwwMCRwYyR0aW1lWm9uZURyb3AkREREBRFjdGwwMCRwYyRwcmludEJ0bgUTY3RsMDAkcGMkcmVmcmVzaEJ0bgUTY3RsMDAkcGMkb3B0aW9uc0J0bgUVY3RsMDAkcGMkZGF0ZURyb3AkREREBRtjdGwwMCRwYyRkYXRlRHJvcCREREQkQyRGTlAFEWN0bDAwJHBjJHRvZGF5QnRuBRdjdGwwMCRwYyRkYXlNb3ZlTGVmdEJ0bgUYY3RsMDAkcGMkZGF5TW92ZVJpZ2h0QnRuBRhjdGwwMCRwYyR3ZWVrTW92ZUxlZnRCdG4FGWN0bDAwJHBjJHdlZWtNb3ZlUmlnaHRCdG4FGWN0bDAwJHBjJG1vbnRoTW92ZUxlZnRCdG4FGmN0bDAwJHBjJG1vbnRoTW92ZVJpZ2h0QnRuBRhjdGwwMCRwYyR5ZWFyTW92ZUxlZnRCdG4FGWN0bDAwJHBjJHllYXJNb3ZlUmlnaHRCdG4FGWN0bDAwJHBjJGJvb2tPcHRpb25zUG9wdXAFNmN0bDAwJHBjJGJvb2tPcHRpb25zUG9wdXAkYXV0b21hdGljYWxseVJlZnJlc2hEcm9wJERERAUyY3RsMDAkcGMkYm9va09wdGlvbnNQb3B1cCRoaWdobGlnaHRDb2xvclBpY2tlciREREQFImN0bDAwJHBjJGJvb2tPcHRpb25zUG9wdXAkY2xvc2VCdG4FIWN0bDAwJHBjJGJvb2tPcHRpb25zUG9wdXAkc2F2ZUJ0bgUSY3RsMDAkcGMkZWRpdFBvcHVwBRRjdGwwMCRwYyRmaWx0ZXJQb3B1cAUuY3RsMDAkcGMkZmlsdGVyUG9wdXAkZmlsdGVyTG9jRHJvcCRsY25Ecm9wJERERAUoY3RsMDAkcGMkZmlsdGVyUG9wdXAkZmxvb3JGaWx0ZXJEcm9wJERERAUrY3RsMDAkcGMkZmlsdGVyUG9wdXAkcm9vbVR5cGVGaWx0ZXJEcm9wJERERAVBY3RsMDAkcGMkZmlsdGVyUG9wdXAkc3BlY2lmaWNSb29tQ2FsbGJhY2tQYW5lbCRhdmFpbGFibGVSb29tc0dyaWQFQmN0bDAwJHBjJGZpbHRlclBvcHVwJHNwZWNpZmljUm9vbUNhbGxiYWNrUGFuZWwkQXZhaWxhYmxlVG9TZWxlY3RlZAVCY3RsMDAkcGMkZmlsdGVyUG9wdXAkc3BlY2lmaWNSb29tQ2FsbGJhY2tQYW5lbCRTZWxlY3RlZFRvQXZhaWxhYmxlBUVjdGwwMCRwYyRmaWx0ZXJQb3B1cCRzcGVjaWZpY1Jvb21DYWxsYmFja1BhbmVsJEFsbFNlbGVjdGVkVG9BdmFpbGFibGUFQGN0bDAwJHBjJGZpbHRlclBvcHVwJHNwZWNpZmljUm9vbUNhbGxiYWNrUGFuZWwkc2VsZWN0ZWRSb29tc0dyaWQFIGN0bDAwJHBjJGZpbHRlclBvcHVwJGZpbHRlck9LQnRuBSRjdGwwMCRwYyRmaWx0ZXJQb3B1cCRmaWx0ZXJDYW5jZWxCdG4FFGN0bDAwJHBjJHdpemFyZFBvcHVwBRVjdGwwMCRwYyRob2xpZGF5UG9wdXAFFGN0bDAwJHBjJGNvbnRleHRNZW51BRBjdGwwMCROYXZJRFBvcHVwBRJjdGwwMCR1dGlsaXR5UG9wdXATpy%2F9qlR5uQS5B3iG86E1A45MlA%3D%3D&__VIEWSTATEGENERATOR=4579F4F6&ctl00_mMSI=2i0i4&ctl00_pc_locDrop_lcnDropKV=27&ctl00%24pc%24locDrop%24lcnDrop=Leonard%20Center&ctl00_pc_locDrop_lcnDrop_DDDWS=0%3A0%3A-1%3A-10000%3A-10000%3A0%3A-10000%3A-10000%3A1%3A0%3A0%3A0&ctl00%24pc%24locDrop%24lcnDrop%24DDD%24DDTC%24bldgDrop=27&ctl00_pc_viewTypeDrop_VI=0&ctl00%24pc%24viewTypeDrop=Daily&ctl00_pc_viewTypeDrop_DDDWS=0%3A0%3A-1%3A-10000%3A-10000%3A0%3A-10000%3A-10000%3A1%3A0%3A0%3A0&ctl00_pc_viewTypeDrop_DDD_LDeletedItems=&ctl00_pc_viewTypeDrop_DDD_LInsertedItems=&ctl00_pc_viewTypeDrop_DDD_LCustomCallback=&ctl00%24pc%24viewTypeDrop%24DDD%24L=&ctl00_pc_timeZoneDrop_VI=63&ctl00%24pc%24timeZoneDrop=Central%20America&ctl00_pc_timeZoneDrop_DDDWS=0%3A0%3A-1%3A-10000%3A-10000%3A0%3A-10000%3A-10000%3A1%3A0%3A0%3A0&ctl00_pc_timeZoneDrop_DDD_LDeletedItems=&ctl00_pc_timeZoneDrop_DDD_LInsertedItems=&ctl00_pc_timeZoneDrop_DDD_LCustomCallback=&ctl00%24pc%24timeZoneDrop%24DDD%24L=&ctl00_pc_dateDrop_Raw=1485475200000&ctl00%24pc%24dateDrop=1%2F27%2F2017&ctl00_pc_dateDrop_DDDWS=0%3A0%3A-1%3A-10000%3A-10000%3A0%3A-10000%3A-10000%3A1%3A0%3A0%3A0&ctl00_pc_dateDrop_DDD_C_FNPWS=0%3A0%3A-1%3A-10000%3A-10000%3A0%3A0px%3A-10000%3A1%3A0%3A0%3A0&ctl00%24pc%24dateDrop%24DDD%24C=&ctl00_pc_bookOptionsPopupWS=0%3A0%3A-1%3A-10000%3A-10000%3A0%3A750px%3A425px%3A1%3A0%3A0%3A0&ctl00%24pc%24bookOptionsPopup%24startHourBox%24box=7%3A00%20AM&ctl00_pc_bookOptionsPopup_automaticallyRefreshDrop_VI=0&ctl00%24pc%24bookOptionsPopup%24automaticallyRefreshDrop=Never&ctl00_pc_bookOptionsPopup_automaticallyRefreshDrop_DDDWS=0%3A0%3A-1%3A-10000%3A-10000%3A0%3A-10000%3A-10000%3A1%3A0%3A0%3A0&ctl00_pc_bookOptionsPopup_automaticallyRefreshDrop_DDD_LDeletedItems=&ctl00_pc_bookOptionsPopup_automaticallyRefreshDrop_DDD_LInsertedItems=&ctl00_pc_bookOptionsPopup_automaticallyRefreshDrop_DDD_LCustomCallback=&ctl00%24pc%24bookOptionsPopup%24automaticallyRefreshDrop%24DDD%24L=&ctl00%24pc%24bookOptionsPopup%24bookDisplayRadio=0&ctl00%24pc%24bookOptionsPopup%24bookDisplayRadio%24RB0=C&ctl00%24pc%24bookOptionsPopup%24bookDisplayRadio%24RB1=U&ctl00%24pc%24bookOptionsPopup%24bookDisplayRadio%24RB2=U&ctl00%24pc%24bookOptionsPopup%24timeDisplayIntervalRadio=0&ctl00%24pc%24bookOptionsPopup%24timeDisplayIntervalRadio%24RB0=C&ctl00%24pc%24bookOptionsPopup%24timeDisplayIntervalRadio%24RB1=U&ctl00%24pc%24bookOptionsPopup%24timeDisplayIntervalRadio%24RB2=U&ctl00%24pc%24bookOptionsPopup%24maxNumberOfRoomsRadio=0&ctl00%24pc%24bookOptionsPopup%24maxNumberOfRoomsRadio%24RB0=C&ctl00%24pc%24bookOptionsPopup%24maxNumberOfRoomsRadio%24RB1=U&ctl00%24pc%24bookOptionsPopup%24maxNumberOfRoomsRadio%24RB2=U&ctl00%24pc%24bookOptionsPopup%24maxNumberOfRoomsRadio%24RB3=U&ctl00%24pc%24bookOptionsPopup%24bookingColorRadio=0&ctl00%24pc%24bookOptionsPopup%24bookingColorRadio%24RB0=C&ctl00%24pc%24bookOptionsPopup%24bookingColorRadio%24RB1=U&ctl00%24pc%24bookOptionsPopup%24highlightRoomsChk=U&ctl00%24pc%24bookOptionsPopup%24highlightColorPicker=%23008000&ctl00_pc_bookOptionsPopup_highlightColorPicker_DDDWS=0%3A0%3A-1%3A-10000%3A-10000%3A0%3A-10000%3A-10000%3A1%3A0%3A0%3A0&ctl00%24pc%24bookOptionsPopup%24bookedSpaceStatusOnlyChk=I&ctl00%24pc%24bookOptionsPopup%24roomDisplayRadio=1&ctl00%24pc%24bookOptionsPopup%24roomDisplayRadio%24RB0=U&ctl00%24pc%24bookOptionsPopup%24roomDisplayRadio%24RB1=C&ctl00%24pc%24bookOptionsPopup%24buildingDisplayRadio=1&ctl00%24pc%24bookOptionsPopup%24buildingDisplayRadio%24RB0=U&ctl00%24pc%24bookOptionsPopup%24buildingDisplayRadio%24RB1=C&ctl00%24pc%24bookOptionsPopup%24goToTodayChk=C&ctl00%24pc%24bookOptionsPopup%24promptForRoomFilterChk=U&ctl00%24pc%24bookOptionsPopup%24hideCurrentTimeIndicatorChk=U&ctl00%24pc%24bookOptionsPopup%24showAllBuildingChk=U&ctl00%24pc%24bookOptionsPopup%24showCapacityChk=C&ctl00%24pc%24bookOptionsPopup%24hideBookingShadowChk=U&ctl00_pc_bookOptionsPopup_toolTipFieldsBoxDeletedItems=&ctl00_pc_bookOptionsPopup_toolTipFieldsBoxInsertedItems=&ctl00_pc_bookOptionsPopup_toolTipFieldsBoxCustomCallback=&ctl00%24pc%24bookOptionsPopup%24toolTipFieldsBox=&ctl00_pc_editPopupWS=0%3A0%3A-1%3A-10000%3A-10000%3A0%3A675px%3A575px%3A1%3A0%3A0%3A0&ctl00_pc_filterPopupWS=0%3A0%3A-1%3A-10000%3A-10000%3A0%3A700px%3A350px%3A1%3A0%3A0%3A0&ctl00%24pc%24filterPopup%24filterType=0&ctl00%24pc%24filterPopup%24filterType%24RB0=C&ctl00%24pc%24filterPopup%24filterType%24RB1=U&ctl00_pc_filterPopup_filterLocDrop_lcnDropKV=27&ctl00%24pc%24filterPopup%24filterLocDrop%24lcnDrop=Leonard%20Center&ctl00_pc_filterPopup_filterLocDrop_lcnDrop_DDDWS=0%3A0%3A-1%3A-10000%3A-10000%3A0%3A-10000%3A-10000%3A1%3A0%3A0%3A0&ctl00%24pc%24filterPopup%24filterLocDrop%24lcnDrop%24DDD%24DDTC%24bldgDrop=27&ctl00_pc_filterPopup_floorFilterDrop_VI=&ctl00%24pc%24filterPopup%24floorFilterDrop=&ctl00_pc_filterPopup_floorFilterDrop_DDDWS=0%3A0%3A-1%3A-10000%3A-10000%3A0%3A-10000%3A-10000%3A1%3A0%3A0%3A0&ctl00_pc_filterPopup_floorFilterDrop_DDD_LDeletedItems=&ctl00_pc_filterPopup_floorFilterDrop_DDD_LInsertedItems=&ctl00_pc_filterPopup_floorFilterDrop_DDD_LCustomCallback=&ctl00%24pc%24filterPopup%24floorFilterDrop%24DDD%24L=&ctl00_pc_filterPopup_roomTypeFilterDrop_VI=-1&ctl00%24pc%24filterPopup%24roomTypeFilterDrop=(all)&ctl00_pc_filterPopup_roomTypeFilterDrop_DDDWS=0%3A0%3A-1%3A-10000%3A-10000%3A0%3A-10000%3A-10000%3A1%3A0%3A0%3A0&ctl00_pc_filterPopup_roomTypeFilterDrop_DDD_LDeletedItems=&ctl00_pc_filterPopup_roomTypeFilterDrop_DDD_LInsertedItems=&ctl00_pc_filterPopup_roomTypeFilterDrop_DDD_LCustomCallback=&ctl00%24pc%24filterPopup%24roomTypeFilterDrop%24DDD%24L=&ctl00%24pc%24filterPopup%24capacityFilterCheck=I&ctl00_pc_filterPopup_capcityNumberFilterBox_Raw=0&ctl00%24pc%24filterPopup%24capcityNumberFilterBox=0&ctl00%24pc%24filterPopup%24roomAvailabilityFilter=0&ctl00%24pc%24filterPopup%24roomAvailabilityFilter%24RB0=C&ctl00%24pc%24filterPopup%24roomAvailabilityFilter%24RB1=U&ctl00%24pc%24filterPopup%24roomAvailabilityFilter%24RB2=U&ctl00%24pc%24filterPopup%24specificRoomCallbackPanel%24availableRoomsGrid%24DXSelInput=&ctl00%24pc%24filterPopup%24specificRoomCallbackPanel%24availableRoomsGrid%24DXKVInput=%5B%5D&ctl00%24pc%24filterPopup%24specificRoomCallbackPanel%24availableRoomsGrid%24CallbackState=BwIHAgIERGF0YQchAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHAAcAAgVTdGF0ZQdBBwQG%2F%2F8CAAcAAgEHAQIBBwICAQcABwAHAAcAAgAFAAAAgAkCAklEBwAJAgACAAMHBAIABwACAQcABwACAQcABwA%3D&ctl00%24pc%24filterPopup%24specificRoomCallbackPanel%24availableRoomsGrid%24DXSyncInput=&ctl00%24pc%24filterPopup%24specificRoomCallbackPanel%24selectedRoomsGrid%24DXSelInput=&ctl00%24pc%24filterPopup%24specificRoomCallbackPanel%24selectedRoomsGrid%24DXKVInput=%5B%5D&ctl00%24pc%24filterPopup%24specificRoomCallbackPanel%24selectedRoomsGrid%24CallbackState=BwIHAgIERGF0YQchAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHAAcAAgVTdGF0ZQdBBwQG%2F%2F8CAAcAAgEHAQIBBwICAQcABwAHAAcAAgAFAAAAgAkCAklEBwAJAgACAAMHBAIABwACAQcABwACAQcABwA%3D&ctl00%24pc%24filterPopup%24specificRoomCallbackPanel%24selectedRoomsGrid%24DXSyncInput=&ctl00_pc_wizardPopupWS=0%3A0%3A-1%3A-10000%3A-10000%3A0%3A1000px%3A700px%3A1%3A0%3A0%3A0&ctl00_pc_holidayPopupWS=0%3A0%3A-1%3A-10000%3A-10000%3A0%3A300px%3A600px%3A1%3A0%3A0%3A0&ctl00_pc_contextMenuSI=&ctl00_NavIDPopupWS=0%3A0%3A-1%3A-10000%3A-10000%3A0%3A495px%3A425px%3A1%3A0%3A0%3A0&ctl00_utilityPopupWS=0%3A0%3A-1%3A-10000%3A-10000%3A0%3A825px%3A700px%3A1%3A0%3A0%3A0&ctl00%24changeDBDrop=deaConnection&__CALLBACKID=__Page&__CALLBACKPARAM=%7B%22EventID%22%3A%222376829%22%2C%22ReservationID%22%3A0%2C%22Building%22%3A%2227%22%2C%22RoomID%22%3A%223478%22%2C%22TimeZone%22%3A%2263%22%2C%22BookDate%22%3A%221%2F29%2F2017%22%2C%22TimeSlot%22%3A-1%2C%22TimeOffset%22%3A0%2C%22Handle%22%3A%22%22%2C%22Duration%22%3A0%2C%22ViewType%22%3A0%2C%22DraggedObject%22%3A%22%22%2C%22Confirmed%22%3Afalse%2C%22AutoAdjust%22%3Afalse%2C%22router%22%3A%22BuildToolTip%22%7D&__EVENTVALIDATION=%2FwEWUAKfiMehDgL99rnQAQL%2F9unTAQL%2F9oXQAQL99snTAQL99oHQAQL49snTAQL99uXTAQL%2B9onQAQL79snTAQL89q3QAQL89onQAQL%2F9onQAQL%2B9snTAQL99r3QAQL99oXQAQLl9snTAQL89snTAQL99unTAQL89oXQAQL99q3QAQL%2F9snTAQLq9snTAQL99onQAQKz4MSfBAKw4JicBAKw4JycBAKz4MifBAKw4JScBAKx4KCcBAKz4KCcBALxsIX6AwKGoYSkDAK7nerHDwLSx5q6AQKM69XBDAKWrevWCQKqtNmFBQK2wdS4CQKLi4nqBQLymongDwLwmtnjDwLwmrXgDwLymvnjDwLymrHgDwL3mvnjDwLymtXjDwLxmrngDwL0mvnjDwLzmp3gDwLzmrngDwLwmrngDwLxmvnjDwLymo3gDwLymrXgDwLqmvnjDwLzmvnjDwLymtnjDwLzmrXgDwLymp3gDwLwmvnjDwLlmvnjDwLymrngDwLipbudCgLhpeeeCgLhpeOeCgLipbedCgLhpeueCgLgpd%2BeCgLipd%2BeCgK%2F0srVDwKewMXoCAK91LP7BwKojOnvBgKw0pjjBgKfvd7dBQLDi5O4DgLjydDLBQLlybDNAQKwjY3wD07U82t5EwtIBg%2FMF5I7bIeBefvf"


def data_pipeline(div_ids_dictionary, valid_room_ids, cookie_string, http_form_data_string):
    """Takes a dictionary of div_id_lists with the key being the date of those events, a list of valid rooom id's,
    a cookie string, and an http form data string and sends sends an http post request for each event to ems.macalester.edu
    to collect the event data. Then the pipeline converts this data to a dictionary and then evenutally to a json format
    to be uploaded to the Secret League database."""

    events_by_date_dictionary = construct_events_by_date_dictionary(div_ids_dictionary, valid_room_ids)
    event_responses_by_date_dictionary = construct_event_responses_by_date_dictionary(events_by_date_dictionary, cookie_string, http_form_data_string)

    for date_string, event_response_dictionaries in event_responses_by_date_dictionary.items():
        create_json_file(date_string, event_response_dictionaries)


data_pipeline(div_ids_dictionary, valid_room_ids, cookie_string, http_form_data_string)
