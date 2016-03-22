// 6x10
//var canvas = document.getElementById("canvas");
//var context = canvas.getContext("2d");

$(document).ready(function(){
	var canvas = $("#canvas")[0];
	var context = canvas.getContext("2d");
	
	var topBar = 60;
	var blockSize = 40;
	var baseNum = 4;
	var velocity = 0.5;
	var spawnSpeed;
	var speedLevel;
	var signWeight;
	var Level;
	var blocks;
	var powerUps;
	var hasPwrUps = [];
	var blockWeight;
	var questionWeight;
	var selected;
	var whichRow;
	var game_loop;
	var spawn_interval;
	var score;
	var highscore = 0;
	var question;

	
	///////////////////
	var selectedColor = "#F4BA84";//#F6A06E #F4BA84
	var strokeColor = "#C5B8A8"; //#8E8579 #C5B8A8
	var normalColor = "#F0E8DF";//#F0E8DF #D2C7BB #F0E8DF
	var barColor = "#FBF9F1";
	var textColor = "#F0E8DF"; //#827970 #F0E8DF 
	var numColor = "#827970";
	var backGroundColor = "#D2C7BB";
	var sideBarColor = "#A89F96";
	//////////////////
	var dx = 0;
	var soundEffect = [new Audio("puff.mp3")];
	var sound = true;
	var pause = false;
	var pauseInterval;
	var p = 0;
	var uP = 120;
	var topBarP = 0;
	var buttomBarP = 0;
	var gameEnd;
	var screens = [true, false, false];
	var base_image = [];
	var animation = true;
	var time = (new Date()).getTime();
	//var selectBar;
	var answerBar = '';
	var n = 3;
	var bomb = false;
	var multipleChoice = [];
	var numberOfPwr;
	var chosenQuestion;
	
	/////////////////
	function initWeight(num){
	    blockWeight = [];
	    for(var i = 0; i < 6; i++)
	        blockWeight[i] = num;
	}
	
	function updateWeight(lastRandNum, coefficient){
	    if(lastRandNum >= 0)
	        blockWeight[lastRandNum] = baseNum;
	    for(i = 0; i < blockWeight.length; i++){
	        if(i != lastRandNum)
	            blockWeight[i] *= coefficient;
	    }
	}
	
	function myRandom(weight){
	    var weightSum = 0; 
	    var randNum;
	    var num = weight.length-1;
	    
	    for(var i = 0; i < weight.length; i++)
	        weightSum += weight[i];
	    
	    randNum = Math.round(Math.random()*weightSum);
	   
	    while((randNum -= weight[num]) > 0){
	        num--;               
	    }
	    return num;
	}
	/////////////////////


	function createBlock(){
	    var randomNum = myRandom(blockWeight);
	    updateWeight(randomNum, 1.5);
	    blocks.push({x: randomNum, y: -1, yEnd: whichRow[randomNum], sign: create_sign(), value: 1+Math.round(Math.random()*5), color: normalColor});
	    whichRow[randomNum]--;
	}
	
	function initBlock(){
	    blocks.push({x: dx, y: whichRow[dx], yEnd: whichRow[dx], sign: create_sign(), value: 1+Math.round(Math.random()*5), color: normalColor});
	    whichRow[dx]--;
	    dx = (dx+1)%6;
	}
	
	function paintBlock(x, y, color, strokeColor, size){
		context.fillStyle = color;
		context.strokeStyle = strokeColor;
		context.fillRect(x*size, y*size+topBar, size, size);
		context.strokeRect(x*size, y*size+topBar, size, size);
	}
	
	function write(block){
	    context.fillStyle = numColor;
	    context.font="20px Arial";
	    var text = block.sign + block.value;
	    if(block.sign === '') //+
	    	context.fillText(text, block.x*blockSize+15, block.y*blockSize+29+topBar);
	    else
	    	context.fillText(text, block.x*blockSize+9, block.y*blockSize+29+topBar);
	}	
	
	function draw(){
		context.lineWidth = 1;
	    paintBlock(0, 0, backGroundColor, backGroundColor, 430);
	    for(var i = 0; i < blocks.length; i++){
	        paintBlock(blocks[i].x, blocks[i].y, blocks[i].color, strokeColor, blockSize);
	        write(blocks[i]);
	    }
	    context.fillStyle = barColor;
		context.fillRect(0, 0, 320, topBar);
	    context.strokeStyle = strokeColor;
	    context.strokeRect(0, 0, 320, topBar);
	    context.fillStyle = strokeColor;
	    context.fillRect(0, 29, 320, 1);
	    context.fillStyle = sideBarColor;
		context.fillRect(240, 60, 80, 430);
	}
	
	function drawHUD(){
	    context.fillStyle = textColor;
	    context.font="15px Arial";
	    var score_text = "Score";
	    context.fillText(score_text, 260, 142);
	    context.fillText(""+score, 275, 167);
	    var highscore_text = "Highscore";
	    context.fillText(highscore_text, 247, 202);
	    context.fillText(""+highscore, 275, 227);
	    var level_text = "Level";
	    context.fillText(level_text, 262, 90);
	    context.fillText(""+level, 275, 115);
	    context.fillStyle = textColor;
	    context.fillRect(250, 410, 63, 40);
	    context.fillStyle = "#827970";
	    context.fillText("New", 267, 426);
	    context.fillText("Game", 261, 443);
	    var question_text = "Question: " + question;
	    context.fillStyle = "#827970";
	    context.fillText(question_text, 115, 20);
	    context.fillText(answerBar, 5, 50);
	    context.fillStyle = textColor;
	    context.fillRect(295, 380, 20, 20);
	    if(!sound)
	    	context.drawImage(base_image[11], 295, 380, 20, 20);
	    else
	    	context.drawImage(base_image[10], 295, 380, 20, 20);
	    context.fillRect(272, 380, 20, 20);
	    if(!pause)
	    	context.drawImage(base_image[9], 272, 380, 20, 20);
	    else
	    	context.drawImage(base_image[8], 272, 380, 20, 20);
	    context.fillRect(249, 380, 20, 20);
	    context.drawImage(base_image[12], 249, 380, 20, 20);
	}
	
	function update(){  
		selectWriter();
		var flag = 0;
	    for(var i = 0; i < blocks.length; i++){
	        if(blocks[i].y !== blocks[i].yEnd){
	            blocks[i].y += velocity;
	            flag = 1;
	        }
	    }
	    draw();
	    for(var i = 0; i < whichRow.length; i++){
	        if(whichRow[i] === -1){
	        	clearInterval(spawn_interval);
	            if(flag === 0){
	            	gameEnd = true;
	                clearInterval(game_loop);
	            }
	            break;
	        }   
	    }        
	    if(checkAnswer(question)){
	    	//selectedBar = [];
	    	if(sound) soundEffect[0].play();
	        score += selected.length;
	        for(var j = 0; j < selected.length; j++){
	            paintBlock(blocks[selected[j]].x, blocks[selected[j]].y, backGroundColor, backGroundColor, blockSize);
	            //drawImage(blocks[selected[j]].x*blockSize, blocks[selected[j]].y*blockSize+topBar, "img1.png");
	            context.drawImage(base_image[0], blocks[selected[j]].x*blockSize,  blocks[selected[j]].y*blockSize+topBar, blockSize, blockSize);
	        }
	        deleteElements();
		    // with this we prevent playing-object from becoming a memory-monster:
		    //soundEffect[0].onended=function(){delete soundEffect[0];};
	        question = create_question();
	    }
	    if(score >= speedLevel){
	        speedLevel += speedLevel+10;
	        level++;
	        //spawnSpeed *= 7/9;
	        if(hasPwrUps.length < numberOfPwr){
	        	var random = 1+Math.round(Math.random()*2);
				if(hasPwrUps.indexOf(1))
					hasPwrUps.push(3);
				else
					hasPwrUps.push(random);
	        }
	        //clearInterval(spawn_interval);
	        //spawn_interval = setInterval(createBlock, spawnSpeed);
	    }
	    if(score > highscore)
	        highscore = score;
	    drawHUD(); 
	    if (!pause)
	    	drawPwrUps();
	}
	
	function pointInBlock(x, y, block) {
	    var minX = block.x*blockSize;
	    var maxX = block.x*blockSize + blockSize;
	    var minY = block.y*blockSize + topBar;
	    var maxY = block.y*blockSize + blockSize + topBar;
	
	    if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
	        return true;
	    }
	    return false;
	}
	
	function pointInNewGame(x, y){
	    if(x >= 250 && x <= 313 && y >= 410 && y <= 450)
	        return true;
	    return false;
	}
	
	function init(){
	    score = 0;
	    speedLevel = 10;
	    gameEnd = false;
	    level = 1;
	    spawnSpeed = 3000;
	    blocks = [];
	    selected = [];
	    randomPowerUps();
	    questionWeight = [90, 20, 5];
	    signWeight = [90, 45, 15, 10]; // +, -, *, /
	    whichRow = [9, 9, 9, 9, 9, 9];
	    for(var i = 0; i < 18; i++)
	        initBlock();
	    question = create_question();
	    draw();
	    drawHUD();
	    drawPwrUps();
	    initWeight(baseNum);
	    if(typeof spawn_interval != undefined) clearInterval(spawn_interval);
	    if(typeof game_loop != undefined) clearInterval(game_loop);
	    spawn_interval = setInterval(createBlock, spawnSpeed);
	    game_loop = setInterval(update, 100);
	}
	
	function handleClicks(e){
		var rect = canvas.getBoundingClientRect();

	    var mouseX = e.clientX - rect.left;
	    var mouseY = e.clientY - rect.top;
	    
	    if(screens[0] === false){
	    	if(screens[2]){
	    		if(pointInRightAns(mouseY)){
	    			screens[2] = false;
	    			screens[1] = true;
	    			setTimeout(init, 500);
	    		}
	    	}
	    	else{
			    if(pointInNewGame(mouseX, mouseY)){ // new game
			    	if(pause && time < (new Date()).getTime()){
			    		pause = false;
			  			pauseInterval = setInterval(unpauseScreen, 50);
			  			time = (new Date()).getTime();
			  			time += 3000;
			  			setTimeout(function(){n--;}, 1000);
			  			setTimeout(function(){n--;}, 2000);
			  			screens[1] = true;
			  			setTimeout(init, 3000);
			    	}
					else if (pause === false && time < (new Date()).getTime())
						init();
			    }
			    else if(mouseX >= 295 && mouseX <= 315 && mouseY >= 380 && mouseY <= 400){ // mute and unmute
			    	if(sound){
						sound = false;
					}
			    	else{
						sound = true;
					}
			    }
			    else if(mouseX >= 272 && mouseX <= 392 && mouseY >= 380 && mouseY <= 400){ // pause and unpause
			    	if(pause && time < (new Date()).getTime()){ //unpause
						pause = false;
			  			pauseInterval = setInterval(unpauseScreen, 50);
			  			time = (new Date()).getTime();
			  			time += 3000;
			  			setTimeout(function(){n--;}, 1000);
			  			setTimeout(function(){n--;}, 2000);
			  			//setTimeout(function(){n--}, 3000);
			  			//spawn_interval = setInterval(createBlock, spawnSpeed);
			  			//game_loop = setInterval(update, 100);
					}
			    	else{
			    		if(gameEnd === false && time < (new Date()).getTime()){ //pause
			    			time = (new Date()).getTime();
			    			pause = true;
			    			draw();
			    			drawHUD();
			    			time += 360;
							screens[1] = false;
							clearInterval(spawn_interval);
				    		clearInterval(game_loop);
				    		pauseInterval = setInterval(pauseScreen, 15);
				    	}
					}
			    }
			    else if(mouseX >= 249 && mouseX <= 269 && mouseY >= 380 && mouseY <= 400){ // clear
			    	 if(pause === false){
				    	 answerBar = '';
				    	 for(var i = 0; i < selected.length; i++){
				    	 	blocks[selected[i]].color = normalColor; 
				    	 }
				    	 selected = [];
			    	 }
			    }
			    else{
			    	if(screens[1]){
						for(var i = 0; i < blocks.length; i++){
							if(pointInBlock(mouseX, mouseY, blocks[i])){
								if(bomb){
			    					bomb = false;
			    					blowUp(blocks[i]);
									hasPwrUps.splice(hasPwrUps.indexOf(1), 1);		    					
			    				}
								else if(blocks[i].color === normalColor){
									blocks[i].color = selectedColor;
						            selected.push(i);
						        }
						        else{
									blocks[i].color = normalColor;
						            selected.splice(selected.indexOf(i), 1);               
						       	}
						        break;
						    }    
						}
						if(type = pointInPowerUps(mouseX, mouseY)){
					    	if(type === 1){
					    		if(bomb === false)
					    			bomb = true;
					    		else
					    			bomb = false;
					    	}
					    	else if(type === 2){
					    		slowDown();
					    		hasPwrUps.splice(hasPwrUps.indexOf(type), 1);
					    	}
					    	else if(type === 3){
					    		question = create_question();
					    		hasPwrUps.splice(hasPwrUps.indexOf(type), 1);
					    	}
					    }
					}
				}
			}
		}
		else{
			if(mouseX >= 127 && mouseX <= 193 && mouseY >= 107 && mouseY <= 173){ // play
				screens[0] = false;
				screens[2] = true;
				context.fillStyle = sideBarColor;
				context.fillRect(0, 0, 320, 430);
				context.drawImage(base_image[2], 127, 107, 63, 63);
				setTimeout(questionScreen, 500);
			}
		}
	}
	
	function deleteElements(){
	    var index;
	    selected.sort(function(a, b){return a-b;});
	    while(selected.length){  
	        index = selected.pop();
	        dropDown(index);
	        whichRow[blocks[index].x]++;
	        blocks.splice(index, 1);
	    }
	}
	function dropDown(index){
	    for(var i = 0; i < blocks.length; i++){
	        if(blocks[i].x === blocks[index].x && blocks[i].yEnd < blocks[index].yEnd)
	            blocks[i].yEnd++;
	    }
	}
	
	function checkAnswer(rightAnswer){
	    var sum = 0.0;
	    var sign;
	    var value;
	    
	    for(var i = 0; i < selected.length; i++){
	    	sign = blocks[selected[i]].sign;
			value = blocks[selected[i]].value;
	    	if(sign === '')
				sum += value;
			else if(sign === '-')
				sum -= value;
			else if(sign === '/')
				sum /= value;
			else
				sum *= value;
	    }
	    if(sum === rightAnswer)
	        return true;
	    return false;
	}
	
	function create_question(){
	    var minNumBlocks;
	    var doubleVar = 0;
	    
	    minNumBlocks = 2+myRandom(questionWeight);
	    
	    for(var i = 0; i < minNumBlocks; i++){
	        doubleVar +=  blocks[Math.round(Math.random()*(blocks.length-1))].value;      
	    }
	    return doubleVar;
	}
	
	/*function drawImage(x, y, img)
	{
	  base_image = new Image();
	  base_image.src = img;
	  context.drawImage(base_image, x, y, blockSize, blockSize);
	}*/
    function loadImg(img)
	{
	  base_image.push(new Image());
	  base_image[(base_image.length)-1].src = img;
	}

	function pauseScreen(){
		context.fillStyle = selectedColor;
		context.fillRect(0, 60, p+=5, 430);
		context.fillRect(240, 60, -p, 430);
		context.fillStyle = backGroundColor;
		context.fillRect(0, 0, 320, topBarP += 1.25);
		context.fillRect(0, 60, 320, buttomBarP -= 1.25);
		if(p === 120){
			clearInterval(pauseInterval);
			p = 0;
		}
	}
	
	function unpauseScreen(){
		draw();
		drawHUD();
		context.fillStyle = selectedColor;
		context.fillRect(0, 60, uP-=2, 430);
		context.fillRect(240, 60, -uP, 430);
		context.fillStyle = backGroundColor;
		context.fillRect(0, 0, 320, topBarP -= 0.5);
		context.fillRect(0, 60, 320, buttomBarP += 0.5);
		context.fillStyle = normalColor;
	    context.font="60px Sans-serif";
	    context.lineWidth = 5;
	    context.strokeStyle = "#8E8579";
	    context.strokeText(""+n, 105, 147);
	    context.fillText(""+n, 105, 147);
	    
		if(uP === 0){
			screens[1] = true;
			clearInterval(pauseInterval);
			spawn_interval = setInterval(createBlock, spawnSpeed);
	  		game_loop = setInterval(update, 100);
			uP = 120;
			n = 3;
		}
	}
	
	function drawMainMenu(){
		context.fillStyle = sideBarColor;
		context.fillRect(0, 0, 320, 460);
		context.drawImage(base_image[1], 127, 107, 66, 66);
	}
	
	function create_sign(){
	    var numSign = 0;
	    
	    numSign = myRandom(signWeight);
	        
	    if(numSign === 0) return '';
	    if(numSign === 1) return '-';
	    if(numSign === 2) return '*';
	    if(numSign === 3) return '/';
	}
	
	function selectWriter(){		
		var sign;
		var value;
		var selectBar = [];
		answerBar = '';
		for (var i = 0; i < selected.length; i++){
			sign = blocks[selected[i]].sign;
			value = blocks[selected[i]].value;
			if(sign === '')
				sign = '+';
			if(i === 0){
				if(sign === '/' || sign === '*')
					selectBar.push(0);
				if(sign != '+')
					selectBar.push(sign);
				selectBar.push(value);
			}
			else{
				if((sign === '/' || sign === '*') && selectBar.length > 2){
					selectBar.push(')');
					selectBar.unshift('(');
				}
				selectBar.push(sign);
				selectBar.push(value);
			}
		}
		for(var j in selectBar)
   			answerBar += " " + selectBar[j];
	}
	
	
	function drawPwrUps(){
		var x = 266; 
		var y = 247;
		for(var i = 0; i < 3; i++){
			context.fillStyle = textColor;
			if(hasPwrUps[i]){
				if(bomb && hasPwrUps[i] === 1)
					context.fillStyle = selectedColor;
				context.fillRect(x, y, 30, 30);
				context.drawImage(base_image[hasPwrUps[i]+2], x, y, 30, 30);
				y += 40;
			}
		}
	}
	
	function randomPowerUps(){
		var random;
		for(var i = hasPwrUps.length; i < numberOfPwr; i++){
			random = 1+Math.round(Math.random()*2);
			if(hasPwrUps.indexOf(1) !== -1)
				hasPwrUps.push(3);
			else
				hasPwrUps.push(random);
		}
	}
	
	function pointInPowerUps(x, y){
		var xPos = 266; 
		var yPos = 247;
		for(var i = 0; i < hasPwrUps.length; i++){
			if(x >= xPos && x <= xPos+30 && y >= yPos && y <= yPos+30)
				return hasPwrUps[i];
			yPos += 40;
		}
		return 0;
	}
	
	function slowDown(){
		clearInterval(spawn_interval);
		spawn_interval = setInterval(createBlock, 5000);
		setTimeout(function(){clearInterval(spawn_interval); spawn_interval = setInterval(createBlock, spawnSpeed);},30000);
	}
	
	function blowUp(block){
		var xPos = block.x;
		var yPos = block.y;
		
		if(sound) soundEffect[0].play();
		for(var i = blocks.length-1; i >= 0; i--){
			if(around(xPos, yPos, blocks[i])){
				paintBlock(blocks[i].x, blocks[i].y, backGroundColor, backGroundColor, blockSize);
	            context.drawImage(base_image[0], blocks[i].x*blockSize,  blocks[i].y*blockSize+topBar, blockSize, blockSize);
				dropDown(i);
		        whichRow[blocks[i].x]++;
		        selected.splice(selected.indexOf(i), 1);
		        blocks.splice(i, 1);
		    }
		}
		
	}
	
	function around(originX, originY, block){
		if(block.x === originX-1 || block.x === originX || block.x === originX+1)
			if(block.y === originY-1 || block.y === originY || block.y === originY+1)
				return true;
		return false;
	}
	
	function questionScreen(){
		var y = 230;
		chosenQuestion = Math.round(Math.random()*(multipleChoice.length-1));
		//var ans = Math.round(Math.random(2));
		context.fillStyle = sideBarColor;
		context.fillRect(0, 0, 320, 460);
		context.drawImage(multipleChoice[chosenQuestion], 0,  0);
		// context.fillText(multipleChoice[index].question, block.x*blockSize+15, block.y*blockSize+29+topBar);
		// for(var i = 0; i < 3; i++){
			// context.drawImage(multipleChoice[index].answer[ans], 100,  y);
			// if(ans === 0)
				// multipleChoice.push(y);
			// ans = (ans+1)%3;
			// y += 100;
		// }
	}
	
	function pointInRightAns(y){
		var yPos = 260;
		if(y >= multipleChoice[chosenQuestion].answer && y <= multipleChoice[chosenQuestion].answer+25){
			context.drawImage(base_image[6], 5,  multipleChoice[chosenQuestion].answer, 20, 20);
			numberOfPwr = 3;
			return true;
		}
		else{
			for(var i = 0; i < 3; i++){
				if(y >= yPos && y <= yPos+25){
					context.drawImage(base_image[7], 5, yPos, 20, 20);
					numberOfPwr = 2;
					return true;
				}
				yPos += 50;
			}
		}
		return false;
	}
	
	function loadQImg(img, answer)
	{
	  multipleChoice.push(new Image());
	  multipleChoice[(multipleChoice.length)-1].src = img;
	  multipleChoice[(multipleChoice.length)-1].answer = answer;
	}
	
	loadImg("Resource/img1.png");
	loadImg("Resource/play1.gif");
	loadImg("Resource/play2.gif");
	loadImg("Resource/bomb.png");
	loadImg("Resource/hourglass.png");
	loadImg("Resource/skip.png");
	loadImg("Resource/checkmark.png");
	loadImg("Resource/x.png");
	loadImg("Resource/play.png");
	loadImg("Resource/pause.png");
	loadImg("Resource/mute.png");
	loadImg("Resource/unmute.png");
	loadImg("Resource/refresh.png");
	loadQImg("Questions/question1.png", 310); //260 310 360
	loadQImg("Questions/question2.png", 310);
	loadQImg("Questions/question3.png", 260);
	loadQImg("Questions/question4.png", 310);
	loadQImg("Questions/question5.png", 360);
	loadQImg("Questions/question6.png", 360);
	loadQImg("Questions/question7.png", 310);
	loadQImg("Questions/question8.png", 360);
	loadQImg("Questions/question9.png", 310);
	setTimeout(drawMainMenu, 1000);
	
	document.addEventListener('click', handleClicks);
});