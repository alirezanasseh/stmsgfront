export default (props) => {
    return {
        base: {
            entities: "دسترسی ها",
            entity: "دسترسی",
            module: "permissions",
            path: "/permissions",
            model: {
                role: {title: "نقش"},
                entity: {title: "موجودیت"},
                limit: {title: "محدودیت"},
                allow: {title: "متدهای مجاز"},
                get: {title: "مشاهده"},
                post: {title: "افزودن"},
                put_query: {title: "دریافت ویرایش"},
                put_set: {title: "اعمال ویرایش"},
                delete: {title: "حذف"},
            }
        },
        list: {
            page: props.page,
            fields: [
                {name: "role"},
                {name: "entity"},
                {name: "limit", style: {direction: "ltr"}},
                {
                    name: "allow",
                    type: "function",
                    value: {
                        func: props.stringify,
                        params: ["allow"]
                    }
                },
                {
                    name: "get",
                    type: "function",
                    value: {
                        func: props.stringify,
                        params: ["get"]
                    }
                },
                {
                    name: "post",
                    type: "function",
                    value: {
                        func: props.stringify,
                        params: ["post"]
                    }
                },
                {
                    name: "put_query",
                    type: "function",
                    value: {
                        func: props.stringify,
                        params: ["put_query"]
                    }
                },
                {
                    name: "put_set",
                    type: "function",
                    value: {
                        func: props.stringify,
                        params: ["put_set"]
                    }
                },
                {
                    name: "delete",
                    type: "function",
                    value: {
                        func: props.stringify,
                        params: ["delete"]
                    }
                },
            ],
            // search: [
            //     {
            //         component_type: "select",
            //         type: "field",
            //         name: "role",
            //         value: "role",
            //         field: "role",
            //         placeholder: "نقش را انتخاب کنبد",
            //         search_type: "exact",
            //         source_data: props.ROLES
            //     },
            //     {
            //         component_type: "text",
            //         type: "field",
            //         name: "entity",
            //         value: "entity",
            //         field: "entity",
            //         placeholder: "موجودیت",
            //         search_type: "regex",
            //         regex_type: "middle"
            //     }
            // ],
            operations: ["add", "edit", "remove"]
        },
        item: {
            id: props.id,
            beforeSubmit: props.convertFields,
            afterSubmit: props.convertBackFields,
            beforeLoad: props.beforeLoad,
            fields: [
                {name: "role", type: "select_items", items: props.ROLES},
                {name: "entity"},
                {name: "limit", style: {direction: "ltr", textAlign: "right"}},
                {name: "allow", type: "select_items", multiple: true, size: 4, items: props.methods},
                {name: "get", default: "{}", style: {direction: "ltr"}},
                {name: "post", default: "{}", style: {direction: "ltr"}},
                {name: "put_query", default: "{}", style: {direction: "ltr"}},
                {name: "put_set", default: "{}", style: {direction: "ltr"}},
                {name: "delete", default: "{}", style: {direction: "ltr"}},
            ]
        }
    };
}