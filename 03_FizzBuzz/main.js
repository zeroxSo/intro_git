// 1から100の数値をループし、3の倍数のときは"Fizz"、5の倍数のときは"Buzz"、3と5の両方の倍数のときは"FizzBuzz"を出力し、それ以外の場合はその数値を出力するプログラム
for (let i = 1; i <= 100; i++) 
{
    if (i % 3 === 0 && i % 5 === 0) 
    {
        console.log("FizzBuzz");
    }
    else if (i % 3 === 0)
    {
        console.log("Fizz");
    } 
    else if (i % 5 === 0) {
        console.log("Buzz");
    } 
    else 
    {
        console.log(i);
    }
}