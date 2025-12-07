var apiUrl = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? "http://localhost:5000"
  : "https://cst3144-fullstack-project-backend.onrender.com";

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
        searchResults: [],
        canCheckout: false
    },
    watch: {
        'order.firstName': function() {
            this.validateCheckout();
        },
        'order.phone': function() {
            this.validateCheckout();
        }
    },
    created() {
        fetch(apiUrl + "/lessons")
        .then(response => response.json())
        .then(res => {
            webstore.products = res.map(lesson => ({
                ...lesson,
                id: lesson._id || lesson.id,
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
            var lessonId = lesson.id || lesson._id;
            if (!lessonId) {
                console.error('Lesson has no ID:', lesson);
                return;
            }
            
            lessonId = String(lessonId);
            
            this.cart.push(lessonId);
            var product = this.products.find(p => {
                var productId = String(p.id || p._id);
                return productId === lessonId;
            });
            
            if (product) {
                product.spaces--;
                product.taken++;
            } else {
                console.error('Product not found for ID:', lessonId);
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
            var lessonIdStr = String(lessonId);
            var lesson = this.products.find(p => {
                var productId = String(p.id || p._id);
                return productId === lessonIdStr;
            });
            if (lesson) {
                var count = this.cart.filter(id => String(id) === lessonIdStr).length;
                this.cart = this.cart.filter(id => String(id) !== lessonIdStr);
                lesson.spaces += count;
                lesson.taken -= count;
            }
        },
        getCartItems() {
            var cartCounts = {};
            this.cart.forEach(id => {
                var idStr = String(id);
                cartCounts[idStr] = (cartCounts[idStr] || 0) + 1;
            });
            
            var uniqueItems = [];
            var seenIds = new Set();
            
            this.cart.forEach(cartId => {
                var cartIdStr = String(cartId);
                if (!seenIds.has(cartIdStr)) {
                    seenIds.add(cartIdStr);
                    var lesson = this.products.find(p => {
                        var productId = String(p.id || p._id);
                        return productId === cartIdStr;
                    });
                    if (lesson) {
                        uniqueItems.push({
                            ...lesson,
                            quantity: cartCounts[cartIdStr]
                        });
                    }
                }
            });
            
            return uniqueItems;
        },
        increaseQty(lessonId) {
            var lessonIdStr = String(lessonId);
            var lesson = this.products.find(p => {
                var productId = String(p.id || p._id);
                return productId === lessonIdStr;
            });
            if (lesson && lesson.spaces > 0) {
                this.cart.push(lessonIdStr);
                lesson.spaces--;
                lesson.taken++;
            }
        },
        decreaseQty(lessonId) {
            var lessonIdStr = String(lessonId);
            var index = this.cart.findIndex(id => String(id) === lessonIdStr);
            if (index > -1) {
                this.cart.splice(index, 1);
                var lesson = this.products.find(p => {
                    var productId = String(p.id || p._id);
                    return productId === lessonIdStr;
                });
                if (lesson) {
                    lesson.spaces++;
                    lesson.taken--;
                }
            }
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
        validateCheckout() {
            var nameRegex = /^[A-Za-z\s]+$/;
            var phoneRegex = /^[0-9]+$/;
            
            if (this.order.firstName.trim() === '' || this.order.phone.trim() === '') {
                this.canCheckout = false;
                return false;
            }
            
            if (!nameRegex.test(this.order.firstName.trim())) {
                this.canCheckout = false;
                return false;
            }
            
            if (!phoneRegex.test(this.order.phone.trim())) {
                this.canCheckout = false;
                return false;
            }
            
            this.canCheckout = true;
            return true;
        },
        getIconClass(lesson) {
            if (lesson.icon) {
                return lesson.icon;
            }
            
            return 'fa-solid fa-graduation-cap';
        },
        submitCheckOut() {
            if (!this.validateForm()) {
                return;
            }
            
            if (this.cart.length === 0) {
                alert('Your cart is empty');
                return;
            }
            
            var cartCounts = {};
            this.cart.forEach(id => {
                var idStr = String(id);
                cartCounts[idStr] = (cartCounts[idStr] || 0) + 1;
            });
            
            var orderData = {
                name: this.order.firstName,
                phone: this.order.phone,
                lessonIDs: Object.keys(cartCounts).map(id => {
                    return {
                        id: id,
                        spaces: cartCounts[id]
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
                    id: String(lesson.id || lesson._id),
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

