import firebase from 'firebase'
import {exists, update, escapeFirebaseKey, getFirebaseToken} from './util'

const logIn = async (referrer) => {
	try { 
		await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
		const provider = new firebase.auth.GoogleAuthProvider()
		const result = await firebase.auth().signInWithPopup(provider)
		return result
	} 
	catch (e) {console.log(e)}
}

const logOut = async () => {
	try {
		await firebase.auth().signOut()
	}
	catch (e) {console.log(e)}
}

const getOwnUid = () => {
	try {
		return firebase.auth().currentUser.uid
	} catch (e) {console.log(e)}
}

const setUniqueUsername = async (uid, username, referralCode) => {
	// dont let user access any database writing functionality unless he has set a unique username
	// if the user has a referral code, pass it here

	username = escapeFirebaseKey(username)

	if ( await usernameIsUnique(username) ) {
		let updates = {}
		updates[`users/${uid}/username`] = username
		updates[`users/${uid}/referredBy`] = referralCode || null
		await update(updates)

		// handle referral
		const token = await getFirebaseToken()
		fetch(`https://us-central1-rozet-486af.cloudfunctions.net/handleReferral?token=${token}`)

		return 'success'
	}
	else {
		console.error('username is not unique')
	}
}

const usernameIsSet = async (uid) => {
	// check if username is set, if username is not set, force them to set their username

	return await exists(`users/${uid}/username`)
}

const usernameIsUnique = async (username) => {
	// check if username is unique, don't let the user set its username if it's not unique

	username = escapeFirebaseKey(username)

	const res = await exists(`userAliases/${username}`)

	if (res === true) return false
	if (res === false) return true
}


const __private = {usernameIsUnique}

export {
	__private,
	logIn, 
	logOut, 
	setUniqueUsername, 
	usernameIsSet,
	getOwnUid
}