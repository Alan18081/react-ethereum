pragma solidity ^0.4.17;

contract Inbox {
    string public message;
    function setMessage(string newMessage) public {
        message = newMessage;
    }
}
