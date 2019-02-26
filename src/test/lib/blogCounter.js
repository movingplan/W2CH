describe("Counter component", function () {
    it("can write slug in local storage when user visits article if it's not been visited", function () {
        let local = {
            items: { visited_articles: `["a", "b" ]` },
            getItem: function (name) {
                return this.items[name];
            },
            setItem: function (name, value) {
                this.items[name] = value;
            }
        };
        let component = new CounterComponent(local);

        component.visit(["tipps-zum-umzug-schweiz", "test"]);
        expect(component.countOfReadArticles()).toBe(3);
    });

    it("can not write same slug in local if article was already visited", function () {
        let local = {
            items: { visited_articles: `["tipps-zum-umzug-schweiz", "b" ]` },
            getItem: function (name) {
                return this.items[name];
            },
            setItem: function (name, value) {
                this.items[name] = value;
            }
        };
        let component = new CounterComponent(local);
        component.visit(["tipps-zum-umzug-schweiz"]);
        component.visit(["tipps-zum-umzug-schweiz"]);
        expect(component.countOfReadArticles()).toBe(2);
    });

    it("should raise event after more then 3 different articles attempted to be visited", function () {
        let local = {
            items: { visited_articles: `["TEST1", "TEST2", "TEST44"]` },
            getItem: function (name) {
                return this.items[name];
            },
            setItem: function (name, value) {
                this.items[name] = value;
            }
        };
        let component = new CounterComponent(local);
        spyOn(component, "openLightBox");
        component.visit(["tipps-zum-umzug-schweiz", "test"]);

        expect(component.countOfReadArticles()).toBe(3);
        expect(component.openLightBox).toHaveBeenCalled();
    });

    it("should count only urls which contain 'tipps-zum-umzug-schweiz' and do not contain 'categories' as part of path array ", function () {
        let local = {
            items: { visited_articles: `["TEST1", "TEST2", "TEST44"]` },
            getItem: function (name) {
                return this.items[name];
            },
            setItem: function (name, value) {
                this.items[name] = value;
            }
        };
        let component = new CounterComponent(local);
        spyOn(component, "openLightBox");
        let path = ["tipps-zum-umzug-schweiz", "test"];
        component.visit(path);

        expect(component.countOfReadArticles()).toBe(3);
        expect(component.openLightBox).toHaveBeenCalled();
    });

    it("should ignore URL slugs which contains tipps-zum-umzug-schweiz along with categories", function () {
        let local = {
            items: { visited_articles: `["TEST1", "TEST2", "TEST44"]` },
            getItem: function (name) {
                return this.items[name];
            },
            setItem: function (name, value) {
                this.items[name] = value;
            }
        };
        let component = new CounterComponent(local);
        let path = ["tipps-zum-umzug-schweiz", "categories"];
        expect(() => component.ignoreUrlIfNeeded(path)).toThrow();
    });

    it("should ignore any path that does not contain 'tipps-zum-umzug-schweiz' as part of URL", function () {
        let local = {
            items: { visited_articles: `["TEST1", "TEST2", "TEST44"]` },
            getItem: function (name) {
                return this.items[name];
            },
            setItem: function (name, value) {
                this.items[name] = value;
            }
        };
        let component = new CounterComponent(local);
        let path = ["anything"];
        expect(() => component.ignoreUrlIfNeeded(path)).not.toThrow();
    });

    it("should ignore root url '/tipps-zum-umzug-schweiz' ", function () {
        let local = {
            items: { visited_articles: null },
            getItem: function (name) {
                return this.items[name];
            },
            setItem: function (name, value) {
                this.items[name] = value;
            }
        };
        let component = new CounterComponent(local);
        let path = ["tipps-zum-umzug-schweiz"];
        component.visit(path);
        expect(component.countOfReadArticles()).toBe(0);
    });
});