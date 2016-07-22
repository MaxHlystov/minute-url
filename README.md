## URL Shortener Microservice

####User Stories
> * I can pass a URL as a parameter and I will receive a shortened URL in the JSON response.

> * If I pass an invalid URL that doesn't follow the valid http://www.example.com format, the JSON response will contain an error instead.

> *  When I visit that shortened URL, it will redirect me to my original link.

Example creation usage:  
[https://minute-url.herokuapp.com/new/https://www.google.com](https://minute-url.herokuapp.com/new/https://www.google.com)  

Example creation output  
```
  {
    "original_url":"https://www.google.com",
    "short_url":"http://minute-url.herokuapp.com/2"
  }
```

Usage of short link: [http://minute-url.herokuapp.com/2](http://minute-url.herokuapp.com/2)  
Will redirect to: [https://www.google.com](https://www.google.com)
