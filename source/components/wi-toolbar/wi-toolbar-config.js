DATA_CONFIG = [
    {
        imgUrl: 'img/ic_folder.png',
        label: 'login',
        handler: 'login'
    },
    {
        imgUrl: 'img/ic_folder.png',
        label: 'file 2',
        handler: 'register'
    },
    {
        imgUrl: 'img/ic_folder.png',
        label: 'file 3',
        handler: '3'
    },
    {
        imgUrl: 'img/ic_folder.png',
        label: 'file 4',
        handler: '4'
    },
    {icon: 'fa fa-user', label: 'Login'}
];

HANDLER_FUNCTION = {
    'login': function () {
        console.log('login');
    },
    'register': function () {
        console.log('register');
    },
    '3': function () {
        console.log('3');
    },
    '4': function () {
        console.log('4');
    }
};