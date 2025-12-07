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
        sortDirection: 'Ascending'
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
        }
    }
});

