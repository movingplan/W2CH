// Filename: public/common/helpers.js 
//
// Code written in public files is shared by your site's
// Backend, page code, and site code environments.
//
// Use public files to hold utility functions that can 
// be called from multiple locations in your site's code.
import wixWindow from 'wix-window';

export function isValidDate( date ) {
	let valid = Date.parse(date) !== "NaN" && Date.parse(date) > new Date();
	return Promise.resolve(valid);
}

export function addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export async function dialog(message) {
    return await  wixWindow.openLightbox('YesNoConfirmation', {title: message});
}