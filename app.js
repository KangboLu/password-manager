console.log('starting password manager'); // welcome message

// import require 'node-persist' package
var crypto = require('crypto-js');
var storage = require('node-persist');
storage.initSync(); 

// create console argument options
// 2 commands: create and get
var argv = require('yargs')
	.command('create', 'Create a new account', function (yargs) {
		yargs.options({
			name: {
				demand: true,
				alias: 'n', // shortcut for name
				description: 'Account name (eg: Twitter, Facebook)',
				type: 'string'
			},
			username: {
				demand: true,
				alias: 'u', // shortcut for username
				description: 'Account username or email',
				type: 'string'
			},
			password: {
				demand: true,
				alias: 'p', // shortcut for password
				description: 'Your password goes here',
				type: 'string'
			},
			masterPassword: {
				demand: true,
				alias: 'm', // shortcut for masterPassword
				description: 'Master password',
				type: 'string'
			}
		}).help('help');
	})
	.command('get', 'Get existing account info', function (yargs) {
		yargs.options({
			name: {
				demand: true,
				alias: 'n', // short cut for name
				description: 'Your name goes here',
				type: 'string'			
			},
			masterPassword: {
				demand: true,
				alias: 'm', // shortcut for masterPassword
				description: 'Master password',
				type: 'string'
			}
		}).help('help');
	})
	.help('help')
	.argv;

// create a varible called command 
// set it equal to the first argument value,
// is the command the user entered
var command = argv._[0];

function getAccounts (masterPassword) {
	// use getItemSync to fetch accounts
	var encryptedAccounts = storage.getItemSync('accounts');
	var accounts = []; 

	// descrypt if not empty
	if (typeof encryptedAccounts !== 'undefined') {
		var bytes = crypto.AES.decrypt(encryptedAccounts, masterPassword);
		var accounts = JSON.parse(bytes.toString(crypto.enc.Utf8));
	}
	
	// return accounts array
	return accounts;
}

function saveAccounts (accounts, masterPassword) {
	// encrypt accounts
	var encryptedAccounts = crypto.AES.encrypt(JSON.stringify(accounts), masterPassword);
	
	// setItemSync
	storage.setItemSync('accounts', encryptedAccounts.toString());
	
	// return accounts array
	return accounts;
}


// function that create account
// required a account object
function createAccount (account, masterPassword) {
	var accounts = getAccounts(masterPassword);

	accounts.push(account);

	saveAccounts(accounts, masterPassword);
	
	return account;

}

// function that get account
// required a existing account name to compare
function getAccount (accountName, masterPassword) {
	var accounts = getAccounts(masterPassword);
	var matchAccount;

	accounts.forEach(function (account) {
		if (account.name === accountName) {
			matchAccount = account;
		}
	});

	return matchAccount;
}

// if else statement to determine the command entered
if (command === 'create') {
	try {
		var createdAccount = createAccount({
			name: argv.name,
			username: argv.username,
			password: argv.password
		}, argv.masterPassword);
		console.log('Account created!');
		console.log(createdAccount);
	} catch (e) {
		console.log('Unable to create account');
	}
} else if (command === 'get') {
	try {
		var fetchedAccount = getAccount(argv.name, argv.masterPassword);

		if (typeof fetchedAccount === 'undefined') {
			console.log('Account not found');
		} else {
			console.log('Account found!');
			console.log(fetchedAccount);
		}
	} catch (e) {
		console.log('Unable to get account');
	}
}














