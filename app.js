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
        },
        sortBy: 'name',
        sortDirection: 'Ascending',
        searchText: '',
        isSearching: false,
        searchResults: []
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
    },
    methods: {
        doSort() {
            var sortField = this.sortBy;
            var isAscending = this.sortDirection === 'Ascending';
            this.products.sort((a, b) => {
                var aVal, bVal;
                if (sortField === 'price' || sortField === 'spaces') {
                    aVal = Number(a[sortField]);
                    bVal = Number(b[sortField]);
                } else {
                    aVal = a[sortField];
                    bVal = b[sortField];
                }
                if (isAscending) {
                    if (aVal > bVal) return 1;
                    if (aVal < bVal) return -1;
                } else {
                    if (aVal > bVal) return -1;
                    if (aVal < bVal) return 1;
                }
                return 0;
            });
            this.sortDirection = isAscending ? 'Descending' : 'Ascending';
        },
        doSearch() {
            var text = this.searchText.trim();
            if (text.length >= 1) {
                this.isSearching = true;
                fetch(apiUrl + "/search?query=" + text)
                .then(response => response.json())
                .then(res => {
                    webstore.searchResults = res;
                    webstore.products = res.map(lesson => ({
                        ...lesson,
                        taken: lesson.taken || 0,
                        initspace: lesson.initspace || lesson.spaces || 0
                    }));
                })
                .catch(error => console.log('Error :', error));
            } else {
                this.isSearching = false;
                fetch(apiUrl + "/lessons")
                .then(response => response.json())
                .then(res => {
                    webstore.products = res.map(lesson => ({
                        ...lesson,
                        taken: lesson.taken || 0,
                        initspace: lesson.initspace || lesson.spaces || 0
                    }));
                })
                .catch(error => console.log('Error :', error));
            }
        },
        addItemtoCart(lesson) {
            this.cart.push(lesson.id);
            var product = this.products.find(p => p.id === lesson.id);
            if (product) {
                product.spaces--;
                product.taken++;
            }
        },
        showCheckOut() {
            if(this.showProduct) {
                this.showProduct = false;
            } else {
                this.showProduct = true;
            }
        },
        canAddtoCart(lesson) {
            return lesson.spaces > 0;
        },
        removeFromCartById(lessonId) {
            var index = this.cart.indexOf(lessonId);
            if (index > -1) {
                this.cart.splice(index, 1);
                var product = this.products.find(p => p.id === lessonId);
                if (product) {
                    product.spaces++;
                    product.taken--;
                }
            }
        },
        getCartItems() {
            return this.cart.map(cartId => {
                return this.products.find(p => p.id === cartId);
            }).filter(item => item !== undefined);
        },
        validateForm() {
            var nameRegex = /^[A-Za-z\s]+$/;
            var phoneRegex = /^[0-9]+$/;
            
            if (!nameRegex.test(this.order.firstName)) {
                alert('Name must contain only letters and spaces');
                return false;
            }
            
            if (!phoneRegex.test(this.order.phone)) {
                alert('Phone must contain only numbers');
                return false;
            }
            
            if (this.order.firstName.trim() === '') {
                alert('Name is required');
                return false;
            }
            
            if (this.order.phone.trim() === '') {
                alert('Phone is required');
                return false;
            }
            
            return true;
        },
        submitCheckOut() {
            if (!this.validateForm()) {
                return;
            }
            
            if (this.cart.length === 0) {
                alert('Your cart is empty');
                return;
            }
            
            var orderData = {
                name: this.order.firstName,
                phone: this.order.phone,
                lessonIDs: this.cart.map(id => {
                    var lesson = this.products.find(p => p.id === id);
                    return {
                        id: id,
                        spaces: 1
                    };
                })
            };
            
            fetch(apiUrl + "/order", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            })
            .then(response => response.json())
            .then(res => {
                var updates = this.products.map(lesson => ({
                    id: lesson.id || lesson._id,
                    spaces: lesson.spaces,
                    taken: lesson.taken || 0
                }));
                
                return fetch(apiUrl + "/lessons", {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updates)
                });
            })
            .then(response => response.json())
            .then(res => {
                alert("Order has been submitted successfully!");
                
                this.cart = [];
                this.order.firstName = '';
                this.order.phone = '';
                this.showProduct = true;
                
                return fetch(apiUrl + "/lessons");
            })
            .then(response => response.json())
            .then(res => {
                webstore.products = res.map(lesson => ({
                    ...lesson,
                    taken: lesson.taken || 0,
                    initspace: lesson.initspace || lesson.spaces || 0
                }));
            })
            .catch(error => {
                console.log('Error:', error);
                alert('Error submitting order');
            });
        }
    },
    computed: {
        itemInCart: function() {
            return this.cart.length || "";
        }
    }
});

