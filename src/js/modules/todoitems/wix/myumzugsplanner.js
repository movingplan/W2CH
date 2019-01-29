import wixWindow from 'wix-window';
import { RepositoryFactory } from 'public/todoitems/repository/repositoryfactory.js'
import wixLocation from 'wix-location';
import { MainService } from 'public/todoitems/services/main.service.js'

let handler;

const getDays = async (before, after) => {
	return { 'days': before, 'days_after_move': after };
}

async function countOfCompleted(repeatedElement, before, after) {
	let days = await getDays(before, after);
	let repository = await RepositoryFactory.get(days);
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

let refreshPage2 = async ($item, itemData, index) => {

	let repeatedElement = $item("#text103");
	let id = itemData._id;

	if (id === "item1") {
		await countOfCompleted(repeatedElement, 0, 14);
	}
	if (id === "item2") {
		await countOfCompleted(repeatedElement, 0, 90);
	}
	if (id === "item3") {
		await countOfCompleted(repeatedElement, 0, 300);
	}
};

const openLightBox = async (before, after, target) => {
	
	await wixWindow.openLightbox("Checklist_3Month", await getDays(before, after));
	
	$w("#repeater1").forEachItem(await refreshPage);
	$w("#repeater2").forEachItem(await refreshPage2);
};

$w.onReady(function () {
	$w('#columnStrip1').hide();
	let md = async () => await MainService.getMoveDate();

	md().then(result => {
		console.log(result);
		 $w('#datePicker1').value = result.moveDate; 
		 });
	//console.log(result);

	$w('#button2').onClick((e) => {
		if (e.context.additionalData.itemId === "item1") {
			openLightBox(0, 14, e.target);
		}
		if (e.context.additionalData.itemId === "item2") {
			openLightBox(0, 90, e.target);
		}

		if (e.context.additionalData.itemId === "item3") {
			openLightBox(0, 300, e.target);
		}
	});

	$w('#button3').onClick((e) => {
		console.log(`id ${e.context.additionalData.itemId}`);
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
	$w("#repeater2").forEachItem(refreshPage2);
});

export async function datePicker1_change(event) {
	let result = await MainService.setMoveDate($w('#datePicker1').value);
	console.log(result);
}