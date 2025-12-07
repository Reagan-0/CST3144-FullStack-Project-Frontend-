var apiUrl = "http://localhost:3000";


let webstore = new Vue({
    el: '#webstore', 
    data: {        
        message: 'Welcome to Lesson Booking!',
        showProduct: true,
        products: [],
        cart: [],
        order: {
            firstName: "",
            phone: ""
        }
    }
});

