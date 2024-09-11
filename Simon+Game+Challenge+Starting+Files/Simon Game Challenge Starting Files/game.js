var buttonColors = ["red","green","blue","yellow"];
var userClickedPattern = [];
var gamePattern = [];
var flag = false;
var level = 0;

function nextSequence(){
    $("h1").text("LEVEL "+ ++level);
    var rno = Math.floor(Math.random()*4);
    var color = randomChosenColour(rno);
    userClickedPattern = [];
    gamePattern.push(color);
    show(color);
    sound(color);
}

function randomChosenColour(no){
    var color = buttonColors[no];
    return color;
}

function show(color){
    $("#"+color).fadeOut(100).fadeIn(100);
}

function sound(color){
    var audio = new Audio("sounds/"+color+".mp3");
    audio.play();
}

function handler(event){
    var userChosenColour = event.target.id;
    userClickedPattern.push(userChosenColour);
    sound(userChosenColour);
    animatePress(userChosenColour);
}

function animatePress(currentColour){
    $("#"+currentColour).addClass("pressed");
    setTimeout(function(){
        $("#"+currentColour).removeClass("pressed");
    },100)
}

function checkAnswer(currentLevel){
    if(userClickedPattern[currentLevel]===gamePattern[currentLevel]){
        console.log("Success");
        if(userClickedPattern.length===gamePattern.length){
            setTimeout(nextSequence,1000);
        }
    }
    else{
        console.log("Wrong");
        incorrect();
    }
}

$(document).keydown(function(){
    if(!flag){
        flag = true;
        $("h1").text("LEVEL "+level);
        nextSequence();
    }
});

$(".btn").click(function(event){
    handler(event);
    checkAnswer(userClickedPattern.length-1);
})

function incorrect(){
    $("h1").text("Game Over, Press Any Key to Restart");
    $("body").addClass("game-over");
    setTimeout(function(){
        $("body").removeClass("game-over");
    },200)
    restart();
}

function restart(){
    flag = false;
    level = 0;
    gamePattern = [];
}