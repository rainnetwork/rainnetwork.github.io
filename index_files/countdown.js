const second = 1000,
      minute = second * 60,
      hour = minute * 60,
      day = hour * 24;

let countDown = new Date('Jun 25, 2020 17:00:00 GMT+00:00').getTime(),
    x = setInterval(function() {    

      let now = new Date().getTime(),
          distance = countDown - now;

      let d = Math.floor(distance / (day))
      let h = Math.floor((distance % (day)) / (hour))
      let m = Math.floor((distance % (hour)) / (minute))
      let s = Math.floor((distance % (minute)) / second)

      if(d.toString().length < 2)
        d= "0"+d;

      if(m.toString().length < 2)
        m= "0"+m;

      if(h.toString().length < 2)
        h= "0"+h;

      if(s.toString().length < 2)
        s= "0"+s;

      document.getElementById('days').innerText = d,
        document.getElementById('hours').innerText = h,
        document.getElementById('minutes').innerText = m,
        document.getElementById('seconds').innerText = s;

        
      //do something later when date is reached
        if (distance < 0) {
          clearInterval(x);
            
        }

    }, second)