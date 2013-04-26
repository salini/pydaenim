#!/usr/bin/env python


import socket

import struct
from base64 import b64encode
from hashlib import sha1
from mimetools import Message
from StringIO import StringIO


class pydaenimWebSocket(object):

    def __init__(self, host="localhost", port=5000, timeout=5):
        self.s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.s.settimeout(timeout)
        self.s.setblocking(True)
        max_port = port + 5000
        while port < max_port:
            try:
                self.s.bind((host, port))
                break
            except socket.error:
                print port
                port += 1
                print("change port!!!")
        self.host = host
        self.port = port
        self.conn = None
        self.addr = None


    def listen(self):
        self.s.listen(1)
        try:
            self.conn, self.addr = self.s.accept()
            print('Connected by', self.addr)
            self.do_handshake()
            print('HandShake done')
        except socket.error:
            print("Connection error: no connection occurs")


    def do_handshake(self):
        """
        """
        print "start doing handshake"
        data = self.conn.recv(1024).strip()
        print "receive msg"
        headers = Message(StringIO(data.split('\r\n', 1)[1]))
        if headers.get("Upgrade", None) != "websocket":
            return
        print 'Handshaking...'
        key = headers['Sec-WebSocket-Key']
        magic = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11'
        digest = b64encode(sha1(key + magic).hexdigest().decode('hex'))
        response = 'HTTP/1.1 101 Switching Protocols\r\n'
        response += 'Upgrade: websocket\r\n'
        response += 'Connection: Upgrade\r\n'
        response += 'Sec-WebSocket-Accept: %s\r\n\r\n' % digest
        self.handshake_done = self.conn.send(response)

    def send_message(self, message):
        """
        """
        self.conn.send(chr(129))
        length = len(message)
        if length <= 125:
            self.conn.send(chr(length))
        elif length >= 126 and length <= 65535:
            self.conn.send(chr(126))
            self.conn.send(struct.pack(">H", length))
        else:
            self.conn.send(chr(127))
            self.conn.send(struct.pack(">Q", length))
        self.conn.send(message)

    def recv_message(self):
        """
        """
        while 1:
            msg = self.conn.recv(2)
            if msg:
                length = ord(msg[1]) & 127
                if length == 126:
                    length = struct.unpack(">H", self.conn.recv(2))[0]
                elif length == 127:
                    length = struct.unpack(">Q", self.conn.recv(8))[0]
                masks = [ord(byte) for byte in self.conn.recv(4)]
                decoded = ""
                msg = ""
                while length != 0:
                    part_msg = self.conn.recv(length)
                    length = length - len(part_msg)
                    msg += part_msg
                for char in msg:
                    decoded += chr(ord(char) ^ masks[len(decoded) % 4])
                return decoded



