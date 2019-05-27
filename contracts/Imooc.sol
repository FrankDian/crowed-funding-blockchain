pragma solidity ^0.4.24;

contract CourseList {
	address public ceo;
	address [] public courses;
	// 以太坊的bytes最长是32位  而ipfs的长度是46bytes  需要将地址分成两份来存储
	bytes23[] public questions;
	constructor() public {
		ceo = msg.sender;
	}
	function createQa(bytes23 _hash1, bytes23 _hash2) public {
		questions.push(_hash1);
		questions.push(_hash2);
	}
	function getQa() public view returns(bytes23[]) {
		return questions;
	}
	function updateQa(uint _index, bytes23 _hash1, bytes23 _hash2) public{
		questions[_index*2] = _hash1;
		questions[_index*2+1] = _hash2;
	}
	function removeQa(uint _index) public {
	// Only CEO can delete
//	require(msg.sender == ceo);
	// Delete by index
//	require(_index<courses.length);
	uint index = _index*2;
	uint len = questions.length;
	for(uint i = index;i<len-2;i=i+2){
		questions[i] = questions[i+2];
		questions[i+1] = questions[i+3];
	}
	delete questions[len-1];
	delete questions[len-2];
	questions.length = len-2;
	}
	
	function createCourse(string _name,string _content,uint _target,uint _fundingPrice,uint _onlinePrice,string _img) public{
		address newCourse = new Course(ceo, msg.sender, _name, _content, _target, _fundingPrice, _onlinePrice, _img);
		courses.push(newCourse);
	}
//	Get all courses' address
	function getCourse() public view returns(address[]){
		return courses;
	}
	function removeCourse(uint _index) public{
		// Only CEO can delete
		require(msg.sender == ceo);
		// Delete by index
		require(_index<courses.length);
		
		uint len = courses.length;
		for(uint i = _index;i<len-1;i++){
			courses[i] = courses[i+1];
		}
		delete courses[len-1];
		courses.length--;
	}
	function isCeo() public view returns(bool) {
		return msg.sender == ceo;
	}
}

contract Course {
	address public ceo;
	address public owner;
	// The author can upload videos
	string public name;
	string public content;
	uint public target;
	uint public fundingPrice;
	uint public onlinePrice;
	string public img;
	string public video;
	bool public isOnline;
	uint public count;
	// Info of users who buy this course
	mapping(address=>uint) public users;
	constructor(address _ceo, address _owner,string _name,string _content,uint _target,uint _fundingPrice,uint _onlinePrice,string _img) public{
		ceo = _ceo;
		owner = _owner;
		name = _name;
		content = _content;
		target = _target;
		fundingPrice = _fundingPrice;
		onlinePrice = _onlinePrice;
		img = _img;
		video = '';
		count = 0;
		isOnline = false;
	}
	function addVideo(string _video) public{
		require(msg.sender==owner);
		require(isOnline==true);
		video = _video;
	}
	// 众筹或者购买
	function buy() public payable{
		// 1. User didn't buy before
		require(users[msg.sender] == 0);
		if(isOnline){
			// Online, must pay by onlinePrice
			require(onlinePrice == msg.value);
		} else {
			// Not online yet, pay by fundingPrice
			require(fundingPrice == msg.value);
		}
		users[msg.sender] = msg.value;
		// total count of buyer
		count += 1;
		if(target <= count*fundingPrice){
			//Sum is beyond the target money
			if(isOnline){
				// already online, CEO and teacher will share the money
				uint value = msg.value;
				ceo.transfer(value/10);
				owner.transfer(value-value/10);
			} else {
				//Not online, first beyond the target sum
				isOnline = true;
				// Transfer
				// The money before online is stored inside the contract, teacher can't get it until online successfully
				owner.transfer(count*fundingPrice);
			}
		}
	}
	// 获取详情
	function getDetail() public view returns(string,string,uint,uint,uint,string,string,uint,bool,uint){
		uint role;
		if(owner == msg.sender){
			role = 0;// Fund raiser
		} else if(users[msg.sender]>0){
			role = 1; // Already bought
		} else {
			role = 2; // Not buy yet
		}
		return (
			name,
			content,
			target,
			fundingPrice,
			onlinePrice,
			img,
			video,
			count,
			isOnline,
			role
		);
	}
}