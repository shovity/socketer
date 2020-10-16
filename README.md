# chạy trên production / có scale
yarn up pro

# chạy trên local / có nodemon để hot reload
yarn
yarn up loc

Cái app này t viết lâu rồi nên hơi bẩn, nó vẫn chạy tốt nên ngại refactor lại
Trước t viết cái này để chạy 1 con duy nhất cho tất cả các môi trường (namespace), có thể mở rộng thêm namespace trong file
config, kiểu này triển khai realtime rất đơn giản, businiss đặt tại socket server nên k cần quan tâm đến nó, mấy năm rồi t
gần như k phải sửa :D
Chưa có authen, đến giờ vẫn thấy chưa cần authen, nếu muốn thì thêm vào lúc emit login thôi
Có một cái api để server chính emit # /api/socket/v1/emitter
Mố hình sẽ là (client, socket, api service), client gọi api từ service, service api push message tới client qua socket app (có thể kèm data
hoặc message kiểu fetch abc lại đi)

Viết bằng compose lên phải scale bằng tay, muốn thay đổi số lượng instal cần
    - sửa range port trong file docker-compose.pro.yml
    - sửa cờ scale trong file bin/up
    - sửa nginx config upsteam

# SERVER CLIENT

const config = require('./config')
const requester = require('./requester')

const socketer = {
    setting: {
        client: config.websocket_client,
        hook: config.websocket_emitter_hook,
    }
}

const setting = socketer.setting

socketer.setting = setting


/**
 * Emitter all socket by default
 * @param option { sid, uid, room }
 */
socketer.emit = (event, data, option={}) => {

    const body = {
        event: event,
        client: setting.client,
    }

    if (data !== undefined) {
        body.data = data
    }

    if (option.sid) {
        body.sid = option.sid
    }
    
    if (option.uid) {
        body.uid = option.uid
    }
    
    if (option.room) {
        body.room = option.room
    }

    return requester.post(setting.hook, body)
}

module.exports = socketer




# CLIENT

import io from 'socket.io-client'

import event from './event'
import config from './config'
import logger from './logger'


let namespace = ''

if (config.env === 'dev' || config.env === 'loc') {
    namespace = 'dev'
} else if (config.env === 'pro') {
    namespace = 'pro'
}

const WEBSOCKET_URL = `https://ws.domain.com/${namespace}`
 
const client = io(WEBSOCKET_URL)

const socket = {
    joinedRooms: [],
}

socket.io = io

socket._io_client = client

client.on('connect', () => {
    socket.id = client.id
    event.emit('socket_connected')
    logger.info(`socket: connected to namespace -> ${namespace}`)

    // re-join rooms
    if (socket.joinedRooms.length !== 0) {
        client.emit('join_room', socket.joinedRooms.join(','))
    }
})

socket.listen = (action, handle) => {

    return client.on(action, handle)
}

socket.join = (name) => {
    if (socket.joinedRooms.indexOf(name) !== -1) {
        return
    }

    socket.joinedRooms.push(name)
    client.emit('join_room', name)
}

socket.leave = (name) => {
    const index = socket.joinedRooms.findIndex(r => r === name)

    if (index === -1) {
        return
    }

    socket.joinedRooms.splice(index, 1)
    client.emit('leave_room', name)
}

socket.emit = (name, payload, callback, ...args) => {
    client.emit(name, payload, callback, ...args)
}


export default socket





# MAIN JS (cái file js cho master layout)

// login websocket
event.listen('socket_connected', () => {

    const user = window.pass?.user || {}

    socket._io_client.emit(
        'login',
        {
            id: user._id || 'anonymous',
            username: user.username || 'anonymous',
            email: user.email || '',
            avatar: user.avatar || '',
            href: location.href || '',
        },
        data => {
            event.emit('socket_logged_in', data)
            logger.info('init: socket logged in')
        }
    )
})

