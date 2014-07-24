> 编写:[spencer198711](https://github.com/spencer198711)

> 校对:

# 用户信息

The Contacts Provider is the central repository of the user's contacts information, including data from contacts apps and social networking apps. In your apps, you can access Contacts Provider information directly by calling ContentResolver methods or by sending intents to a contacts app.

This class focuses on retrieving lists of contacts, displaying the details for a particular contact, and modifying contacts using intents. The basic techniques described here can be extended to perform more complex tasks. In addition, this class helps you understand the overall structure and operation of the Contacts Provider.


## Lessons

* [**Retrieving a List of Contacts**](retrieve-names.html)

  Learn how to retrieve a list of contacts for which the data matches all or part of a search string, using the following techniques:

  * Match by contact name
  * Match any type of contact data
  * Match a specific type of contact data, such as a phone number


* [**Retrieving Details for a Contact**](retrieve-detail.html)

  Learn how to retrieve the details for a single contact. A contact's details are data such as phone numbers and email addresses. You can retrieve all details, or you can retrieve details of a specific type, such as all email addresses.


* [**Modifying Contacts Using Intents**](modify-data.html)

  Learn how to modify a contact by sending an intent to the People app.


* [**Displaying the Quick Contact Badge**](display-badge.html)

  Learn how to display the QuickContactBadge widget. When the user clicks the contact badge widget, a dialog opens that displays the contact's details and action buttons for apps that can handle the details. For example, if the contact has an email address, the dialog displays an action button for the default email app.
