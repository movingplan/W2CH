import wixWindow from 'wix-window';
import { RepositoryFactory } from 'public/todoitems/repository/repositoryfactory.js'

let handler;

const getDays = async (before, after) => {
	return  { 'days': before, 'days_after_move': after };
}

async function countOfCompleted(repeatedElement, before, after) {
	let days = await getDays(before, after);
	let repository = await RepositoryFactory.get(days);
    console.log(repository, repeatedElement,before,after);
	repeatedElement.text = await repository.countOfCompleted();
	await repeatedElement.show();
}

let refreshPage = async ($item, itemData, index) => {

	let repeatedElement = $item("#text99");
	let id = itemData._id;

	if (id === "item1") {
		await countOfCompleted(repeatedElement, 30, 0);
	}
	if (id === "item2") {
		await countOfCompleted(repeatedElement, 90, 0);
	}
	if (id === "item3") {
		await countOfCompleted(repeatedElement, 14, 0);
	}

	if (id === "item-joycfg3r") {
		await countOfCompleted(repeatedElement, 1, 0);
	}

	if (id === "item-joycix94") {
		await countOfCompleted(repeatedElement, 0, 0);
	}

};

const openLightBox = async (before, after, target) => {
	let interval = setInterval(() => { $w("#repeater1").forEachItem(refreshPage) }, 1000);
	let days = await getDays(before, after);
	await wixWindow.openLightbox("Checklist_3Month", days);
	clearInterval(interval);
	$w("#repeater1").forEachItem(refreshPage);
};

$w.onReady(function () {

	$w('#button3').onClick((e) => {
		if (e.context.additionalData.itemId === "item1") {
			openLightBox(30, 0, e.target);
		}
		if (e.context.additionalData.itemId === "item2") {
			openLightBox(90, 0, e.target);
		}

		if (e.context.additionalData.itemId === "item3") {
			openLightBox(14, 0, e.target);
		}

		if (e.context.additionalData.itemId === "item-joycfg3r") {
			openLightBox(1, 0, e.target);
		}

		if (e.context.additionalData.itemId === "item-joycix94") {
			openLightBox(0, 0, e.target);
		}
	});

	$w("#repeater1").forEachItem(refreshPage);

});
