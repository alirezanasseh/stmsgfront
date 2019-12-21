export default (props) => {
    return {
        base: {
            entities: "کاربران",
            entity: "کاربر",
            module: "users",
            path: "/users",
            model: {
                pic: {title: "تصویر", type: "image", width: 400, height: 400},
                title: {title: "عنوان"},
                name: {title: "نام"},
                gender: {
                    title: "جنسیت",
                    type: "select",
                    items: [
                        {key: 0, value: "خانم"},
                        {key: 1, value: "آقا"},
                        {key: 2, value: "مشخص نشده"},
                    ]
                },
                password: {title: "رمز عبور"},
                country_id: {
                    title: "کشور",
                    type: "foreign",
                    foreign: {
                        module: "countries",
                        path: "/countries",
                        field: "id",
                        result: [{name: "name"}]
                    }
                },
                city_id: {
                    title: "شهر",
                    type: "foreign",
                    foreign: {
                        module: "cities",
                        path: "/cities",
                        field: "id",
                        result: [{name: "name"}]
                    }
                },
                address: {title: "آدرس"},
                lat: {title: "عرض جغرافیایی"},
                lon: {title: "طول جغرافیایی"},
                email: {title: "ایمیل"},
                mobile: {title: "موبایل"},
                instagram: {title: "اینستاگرام"},
                education: {title: "تحصیلات"},
                specialties: {title: "تخصص"},
                skills: {title: "مهارت ها"},
                job: {title: "شغل"},
                bio: {title: "بیوگرافی"},
                role: {title: "نقش"},
                referrer_id: {
                    title: "معرف",
                    type: "foreign",
                    foreign: {
                        module: "users",
                        path: "/users",
                        field: "id",
                        result: [
                            {name: "name"},
                            {type: "static", value: " "},
                            {name: "family"}
                        ]
                    }
                },
            }
        },
        list: {
            page: props.page,
            fields: [
                {name: "pic"},
                {name: "name"},
                {name: "country_id"},
                {name: "city_id"},
                {name: "mobile"},
                {name: "instagram"},
                {name: "education"},
                {name: "specialties"},
                {name: "job"},
                {name: "referrer_id"},
            ],
            search: [
                {
                    component_type: "text",
                    type: "field",
                    name: "name",
                    value: "name",
                    field: "name",
                    placeholder: "جستجو براساس نام",
                    search_type: "regex",
                    regex_type: "middle"
                },
                {
                    component_type: "text",
                    type: "field",
                    name: "mobile",
                    value: "mobile",
                    field: "mobile",
                    placeholder: "جستجو براساس موبایل",
                    search_type: "regex",
                    regex_type: "start"
                },
            ],
            operations: ["add", "edit", "remove"]
        },
        item: {
            id: props.id,
            fields: [
                {name: "pic"},
                {name: "name"},
                {name: "gender"},
                {name: "password"},
                {name: "country_id", type: "select_data"},
                {name: "city_id", type: "select_data"},
                {name: "address", type: "textarea", rows: 2},
                {name: "lat"},
                {name: "lon"},
                {name: "email"},
                {name: "mobile"},
                {name: "instagram"},
                {name: "education"},
                {name: "specialties"},
                {name: "skills"},
                {name: "job"},
                {name: "role", type: "select_items", items: props.ROLES},
                {name: "bio", type: "textarea", rows: 10},
            ]
        }
    };
}