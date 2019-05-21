pragma solidity ^0.4.24;

contract CourseList {
	address public ceo;
	
	// 需要外部调用,所以为public
	constructor() public {
		ceo = msg.sender;
	}
}
