function cel_fer(val){
    var fer = val*(9/5) +32;
    return fer;
}

function fer_cel(val){
    return (val-32)*(5/9);
}

$("#Celsius").keydown(function(){
    setTimeout(function(){
        var cel = $("#Celsius").val();
        var fer = cel_fer(cel);
        $("#Farenheit").val(fer);
    },100);
})
$("#Farenheit").keydown(function(){
    setTimeout(function(){
        var fer = $("#Farenheit").val();
        var cel = fer_cel(fer);
        $("#Celsius").val(cel);
    },100);
})