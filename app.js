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
    },
    created() {
        fetch(apiUrl + "/lessons")
        .then(response => response.json())
        .then(res => {
            webstore.products = res.map(lesson => ({
                ...lesson,
                taken: lesson.taken || 0,
                initspace: lesson.initspace || lesson.spaces || 0
            }));
            console.log(webstore.products)
        })
        .catch(error => console.log('Error :', error))
        .finally(() => console.log('Fetch request completed'))
    }
});

