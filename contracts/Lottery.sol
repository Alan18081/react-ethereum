pragma solidity ^0.4.17;

contract Lottery {
    address public manager;
    address public winner;
    address[] public players;
    constructor() public payable {
        manager = msg.sender;
    }
    function enter() public payable {
        require(msg.value > .001 ether);
        players.push(msg.sender);
    }
    function random() public view returns (uint) {
        return uint(keccak256(block.difficulty,now,players));
    }
    function pickWinner() public restricted {
        uint index = random() % players.length;
        players[index].transfer(address(this).balance);
        players = new address[](0);
        winner = players[index];
    }
    modifier restricted() {
        require(msg.sender == manager);
        _;
    }
    function getPlayers() public view returns (address[]) {
        return players;
    }
}