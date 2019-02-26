// Filename: public/common/blog-counter.js 
import wixWindow from 'wix-window';
class CounterComponent {
	constructor(local) {
		this.KEY = "visited_articles";
		this.local = local;
		this.slugs = new Set(JSON.parse(this.getArticles()));
		this.openLightBoxIfNeeded();
	}

	ignoreUrlIfNeeded(path) {
		if (Array.isArray(path) === false) {
			throw new Error(`given path is not an array`);
		}
		const articleSlug = path.map(v => v.toLowerCase());
		if (articleSlug.includes("tipps-zum-umzug-schweiz") && articleSlug.length === 1) {
			return true;
		}
		if (
			articleSlug.includes("tipps-zum-umzug-schweiz") === false &&
			articleSlug.includes("categories") === false
		) {
			return true;
		}
		let userReadArticles =
			articleSlug.includes("tipps-zum-umzug-schweiz") &&
			!articleSlug.includes("categories");
		if (userReadArticles === false) {
			throw new Error(`not observable path ${articleSlug}`);
		}
		return false;
	}
	openLightBoxIfNeeded() {
		if (this.countOfReadArticles() > 3) {
			this.openLightBox();
		}
	}

	getArticles() {
		return this.local.getItem(this.KEY);
	}

	saveArticles() {
		this.local.setItem(this.KEY, JSON.stringify(Array.from(this.slugs)));
	}

	visit(slug) {
		if (this.ignoreUrlIfNeeded(slug)) {
			return;
		}

		const url = slug.join("/");
		if (this.slugs.has(url) === false && this.countOfReadArticles() === 3) {
			this.openLightBox();
		}

		if (this.slugs.has(url) === false && this.countOfReadArticles() < 3) {
			this.slugs.add(url);
			this.saveArticles();
		}
	}

	openLightBox() {
		console.log(`opening light box`);
		wixWindow.openLightbox("Registration", { mode: 'exceededReadingQuota' });
	}

	countOfReadArticles() {
		let num = 0;
		if (this.getArticles() !== null) {
			num = JSON.parse(this.getArticles()).length;
		}
		return num;
	}
}

import { local } from 'wix-storage';

export function blogCounter(slug) {
	let component = new CounterComponent(local);
	component.visit(slug);
}

export function visitedArticles() {
	let component = new CounterComponent(local);
	return component.countOfReadArticles();
}

// The following code demonstrates how to call the add
// function from your site's page code or site code.

/* 
import {add} from 'public/common/blog-counter.js'

$w.onReady(function () {	
    let sum = add(6,7);
    console.log(sum);
});
*/

//The following code demonstrates how to call the add 
//function in one of your site's backend files.

/* 
import {add} from 'public/common/blog-counter.js'

export function usingFunctionFromPublic(a, b) {
	return add(a,b);
}
*/