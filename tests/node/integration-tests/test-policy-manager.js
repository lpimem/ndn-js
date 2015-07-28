/**
 * Copyright (C) 2014-2015 Regents of the University of California.
 * @author: Jeff Thompson <jefft0@remap.ucla.edu>, Jiayi Meng <mjycom@hotmail.com>
 * From PyNDN unit-tests by Adeola Bannis.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version, with the additional exemption that
 * compiling, linking, and/or using OpenSSL is allowed.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */
 
var assert = require("assert");
var fs = require("fs");
var Name = require('../../..').Name;
var Data = require('../../..').Data;
var Blob = require('../../..').Blob;
var KeyType = require('../../..').KeyType;
var MemoryIdentityStorage = require('../../..').MemoryIdentityStorage;
var MemoryPrivateKeyStorage = require('../../..').MemoryPrivateKeyStorage;
var IdentityManager = require('../../..').IdentityManager;
var KeyChain = require('../../..').KeyChain;
var ConfigPolicyManager = require('../../..').ConfigPolicyManager;
var NoVerifyPolicyManager = require('../../..').NoVerifyPolicyManager;
var SelfVerifyPolicyManager = require('../../..').SelfVerifyPolicyManager;
var Face = require('../../..').Face;
var Interest = require('../../..').Interest;
var IdentityCertificate = require('../../../js/security/certificate/identity-certificate.js').IdentityCertificate;

var DEFAULT_RSA_PUBLIC_KEY_DER = new Buffer([
  0x30, 0x82, 0x01, 0x22, 0x30, 0x0d, 0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01,
  0x01, 0x05, 0x00, 0x03, 0x82, 0x01, 0x0f, 0x00, 0x30, 0x82, 0x01, 0x0a, 0x02, 0x82, 0x01, 0x01,
  0x00, 0xd4, 0x4f, 0xd9, 0xae, 0x7a, 0xd2, 0x87, 0x80, 0x67, 0x11, 0x31, 0xb8, 0x5b, 0xac, 0x8b,
  0x5f, 0xf2, 0x21, 0x28, 0x2c, 0x70, 0xec, 0x66, 0xe9, 0x18, 0xee, 0x5e, 0xf1, 0xe3, 0xef, 0x09,
  0xcb, 0x5e, 0xe0, 0xcd, 0xe4, 0x39, 0x6a, 0x3f, 0x43, 0x2a, 0x3e, 0x1a, 0x06, 0xf2, 0xcc, 0xb0,
  0x0f, 0x5b, 0xd8, 0xa1, 0x3f, 0x1c, 0xb8, 0xfa, 0x8c, 0xa4, 0xbf, 0xa0, 0x57, 0x61, 0xcb, 0x35,
  0xa9, 0x0f, 0x56, 0x76, 0x57, 0x05, 0xa4, 0x56, 0x90, 0x64, 0x3d, 0x0e, 0x6e, 0x24, 0x43, 0x5e,
  0x54, 0x02, 0x99, 0x5b, 0xbe, 0x05, 0xab, 0xc9, 0xfb, 0xb7, 0x8f, 0x17, 0xcb, 0x59, 0xc0, 0x42,
  0x47, 0x79, 0xb1, 0xb8, 0x5c, 0x97, 0xef, 0xab, 0x65, 0x21, 0x88, 0xbd, 0x58, 0x3e, 0x9a, 0x8e,
  0x77, 0x84, 0x6c, 0x3d, 0x1a, 0x71, 0x7a, 0xb5, 0x9b, 0xc4, 0xde, 0xe5, 0x24, 0x18, 0x62, 0x61,
  0x58, 0x40, 0x14, 0x65, 0x6d, 0x8f, 0xa4, 0x82, 0x3e, 0xbe, 0xe9, 0x7a, 0xfa, 0x54, 0x9d, 0x9a,
  0xd3, 0x93, 0x44, 0x5c, 0x62, 0x9a, 0x26, 0x5e, 0x6b, 0x4c, 0xb5, 0x15, 0xe4, 0xe9, 0x4b, 0x4f,
  0x06, 0xd7, 0x59, 0x46, 0xfc, 0x4b, 0x3e, 0x09, 0x01, 0x0b, 0xd4, 0xa8, 0xcb, 0x39, 0x15, 0x4d,
  0x05, 0x0f, 0x3f, 0x08, 0x51, 0x8e, 0x3a, 0x20, 0x7e, 0xb3, 0x01, 0x7b, 0xe0, 0xeb, 0x3d, 0x62,
  0xdc, 0x0a, 0x9e, 0x63, 0x57, 0xcd, 0x68, 0xd8, 0xbe, 0xff, 0x3e, 0x3c, 0x33, 0x6c, 0x0d, 0xd8,
  0xb5, 0x4e, 0xdf, 0xeb, 0xef, 0x3b, 0x7d, 0xba, 0x32, 0xc0, 0x53, 0x48, 0x7e, 0x77, 0x91, 0xc7,
  0x7a, 0x2d, 0xb8, 0xaf, 0x8b, 0xe7, 0x8c, 0x0e, 0xa9, 0x39, 0x49, 0xdc, 0xa5, 0x4e, 0x7d, 0x3b,
  0xc9, 0xbf, 0x18, 0x41, 0x5e, 0xc0, 0x55, 0x4f, 0x90, 0x66, 0xfb, 0x19, 0xc8, 0x4b, 0x11, 0x93,
  0xff, 0x02, 0x03, 0x01, 0x00, 0x01
]);

var DEFAULT_RSA_PRIVATE_KEY_DER = new Buffer([
  0x30, 0x82, 0x04, 0xbe, 0x02, 0x01, 0x00, 0x30, 0x0d, 0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7,
  0x0d, 0x01, 0x01, 0x01, 0x05, 0x00, 0x04, 0x82, 0x04, 0xa8, 0x30, 0x82, 0x04, 0xa4, 0x02, 0x01,
  0x00, 0x02, 0x82, 0x01, 0x01, 0x00, 0xd4, 0x4f, 0xd9, 0xae, 0x7a, 0xd2, 0x87, 0x80, 0x67, 0x11,
  0x31, 0xb8, 0x5b, 0xac, 0x8b, 0x5f, 0xf2, 0x21, 0x28, 0x2c, 0x70, 0xec, 0x66, 0xe9, 0x18, 0xee,
  0x5e, 0xf1, 0xe3, 0xef, 0x09, 0xcb, 0x5e, 0xe0, 0xcd, 0xe4, 0x39, 0x6a, 0x3f, 0x43, 0x2a, 0x3e,
  0x1a, 0x06, 0xf2, 0xcc, 0xb0, 0x0f, 0x5b, 0xd8, 0xa1, 0x3f, 0x1c, 0xb8, 0xfa, 0x8c, 0xa4, 0xbf,
  0xa0, 0x57, 0x61, 0xcb, 0x35, 0xa9, 0x0f, 0x56, 0x76, 0x57, 0x05, 0xa4, 0x56, 0x90, 0x64, 0x3d,
  0x0e, 0x6e, 0x24, 0x43, 0x5e, 0x54, 0x02, 0x99, 0x5b, 0xbe, 0x05, 0xab, 0xc9, 0xfb, 0xb7, 0x8f,
  0x17, 0xcb, 0x59, 0xc0, 0x42, 0x47, 0x79, 0xb1, 0xb8, 0x5c, 0x97, 0xef, 0xab, 0x65, 0x21, 0x88,
  0xbd, 0x58, 0x3e, 0x9a, 0x8e, 0x77, 0x84, 0x6c, 0x3d, 0x1a, 0x71, 0x7a, 0xb5, 0x9b, 0xc4, 0xde,
  0xe5, 0x24, 0x18, 0x62, 0x61, 0x58, 0x40, 0x14, 0x65, 0x6d, 0x8f, 0xa4, 0x82, 0x3e, 0xbe, 0xe9,
  0x7a, 0xfa, 0x54, 0x9d, 0x9a, 0xd3, 0x93, 0x44, 0x5c, 0x62, 0x9a, 0x26, 0x5e, 0x6b, 0x4c, 0xb5,
  0x15, 0xe4, 0xe9, 0x4b, 0x4f, 0x06, 0xd7, 0x59, 0x46, 0xfc, 0x4b, 0x3e, 0x09, 0x01, 0x0b, 0xd4,
  0xa8, 0xcb, 0x39, 0x15, 0x4d, 0x05, 0x0f, 0x3f, 0x08, 0x51, 0x8e, 0x3a, 0x20, 0x7e, 0xb3, 0x01,
  0x7b, 0xe0, 0xeb, 0x3d, 0x62, 0xdc, 0x0a, 0x9e, 0x63, 0x57, 0xcd, 0x68, 0xd8, 0xbe, 0xff, 0x3e,
  0x3c, 0x33, 0x6c, 0x0d, 0xd8, 0xb5, 0x4e, 0xdf, 0xeb, 0xef, 0x3b, 0x7d, 0xba, 0x32, 0xc0, 0x53,
  0x48, 0x7e, 0x77, 0x91, 0xc7, 0x7a, 0x2d, 0xb8, 0xaf, 0x8b, 0xe7, 0x8c, 0x0e, 0xa9, 0x39, 0x49,
  0xdc, 0xa5, 0x4e, 0x7d, 0x3b, 0xc9, 0xbf, 0x18, 0x41, 0x5e, 0xc0, 0x55, 0x4f, 0x90, 0x66, 0xfb,
  0x19, 0xc8, 0x4b, 0x11, 0x93, 0xff, 0x02, 0x03, 0x01, 0x00, 0x01, 0x02, 0x82, 0x01, 0x00, 0x0f,
  0xa1, 0x85, 0x5c, 0x44, 0x2c, 0xa5, 0xcf, 0x3d, 0x47, 0x55, 0xca, 0xc5, 0xed, 0x11, 0x21, 0xd2,
  0x38, 0xc0, 0xb5, 0x6c, 0xe6, 0xea, 0xb8, 0xb4, 0x9e, 0x30, 0x1d, 0x4c, 0xf3, 0xb7, 0x5b, 0xe2,
  0xb3, 0x58, 0x55, 0x3a, 0x28, 0xe9, 0x59, 0x6f, 0x8d, 0xbc, 0xea, 0xd0, 0x0b, 0x63, 0xd6, 0xed,
  0xa3, 0x28, 0x53, 0xf6, 0x30, 0x64, 0x39, 0xe0, 0x93, 0x3f, 0x21, 0xcf, 0xd0, 0x5f, 0x36, 0x00,
  0x2c, 0x14, 0x70, 0x59, 0xb8, 0xfc, 0xaa, 0x8a, 0xc6, 0xb7, 0xfe, 0x41, 0xeb, 0x37, 0xd1, 0xa5,
  0x93, 0x56, 0xde, 0xc9, 0x9a, 0x19, 0x37, 0xd0, 0x0e, 0xd7, 0xe8, 0x9f, 0xc5, 0xf8, 0xdb, 0x3c,
  0x49, 0x6a, 0x52, 0x5e, 0xd9, 0x45, 0x5c, 0x1f, 0xb8, 0xea, 0x7f, 0xc9, 0xb4, 0x25, 0x53, 0x05,
  0x4b, 0xd6, 0xbf, 0xd0, 0xa5, 0x01, 0x23, 0xe3, 0xbd, 0xa9, 0x4f, 0x1c, 0x00, 0x7a, 0x3c, 0x1b,
  0xbb, 0xaa, 0x08, 0xd9, 0xd2, 0x8c, 0xdb, 0xb4, 0x6c, 0xff, 0x57, 0x64, 0x82, 0xbb, 0x02, 0x71,
  0x2d, 0x99, 0xea, 0x8a, 0x4e, 0x5a, 0xdb, 0x82, 0x20, 0x32, 0x51, 0xf8, 0x30, 0x98, 0x67, 0x4a,
  0x31, 0x73, 0xb1, 0xd7, 0x51, 0xc5, 0x71, 0x82, 0x2b, 0x99, 0xbc, 0x0c, 0xfa, 0x24, 0x4c, 0x0b,
  0x38, 0x73, 0xd8, 0xef, 0x6f, 0x5b, 0xda, 0x56, 0xc8, 0x6b, 0xcb, 0xf5, 0xc6, 0xaa, 0x4d, 0x8b,
  0x39, 0x0f, 0x0a, 0x43, 0x4e, 0x8b, 0x87, 0xe7, 0x98, 0x5a, 0x0d, 0x94, 0x55, 0xc7, 0x42, 0xb4,
  0x13, 0xfa, 0xed, 0x9c, 0xfe, 0xea, 0x2d, 0x95, 0xc1, 0xdc, 0x2f, 0x5d, 0x44, 0xf5, 0x2d, 0xab,
  0x8b, 0x79, 0x70, 0x0f, 0xe9, 0xa7, 0x17, 0xe8, 0x40, 0xd7, 0xa5, 0x0d, 0x97, 0xe9, 0x53, 0xa4,
  0xb4, 0x70, 0xbe, 0x19, 0x7b, 0x86, 0x2c, 0x26, 0xe7, 0xb1, 0x23, 0x22, 0x5a, 0xbd, 0x91, 0x02,
  0x81, 0x81, 0x00, 0xe2, 0x4d, 0x3c, 0xdc, 0x23, 0xb5, 0x2d, 0xc4, 0x66, 0xe7, 0xf2, 0xa4, 0x33,
  0xb9, 0xd6, 0xdd, 0x39, 0xc6, 0xee, 0x0e, 0xe6, 0x23, 0xbb, 0x9c, 0xf0, 0x6a, 0x10, 0xa8, 0x12,
  0xaa, 0x15, 0x8c, 0x08, 0x51, 0x5d, 0xed, 0x46, 0x33, 0xb0, 0x5d, 0x72, 0x02, 0xa0, 0x16, 0xb8,
  0xcf, 0xaa, 0x27, 0x09, 0x74, 0x97, 0x8c, 0xac, 0x8d, 0x4e, 0xbc, 0xe8, 0x62, 0xe5, 0x1e, 0x3c,
  0x74, 0xbb, 0xe9, 0xb9, 0xa6, 0x91, 0x02, 0x3f, 0x43, 0x4d, 0x2f, 0x01, 0x2a, 0x1c, 0xff, 0x4f,
  0x05, 0xf5, 0x98, 0x57, 0x3f, 0x67, 0xb0, 0x2d, 0x84, 0x2d, 0xd3, 0xf5, 0xb9, 0xd7, 0x37, 0x39,
  0x2a, 0x44, 0x04, 0x58, 0xa4, 0x17, 0x1e, 0x47, 0x38, 0x3f, 0x7d, 0x61, 0x97, 0xf2, 0xe4, 0xe5,
  0xeb, 0xe8, 0xbf, 0x55, 0xac, 0x6b, 0x74, 0xb8, 0x55, 0x2b, 0x1c, 0x12, 0x2a, 0x9c, 0x11, 0xf0,
  0x5b, 0x9d, 0xd7, 0x02, 0x81, 0x81, 0x00, 0xf0, 0x2c, 0x9d, 0xa3, 0x34, 0x0b, 0x6a, 0x01, 0x69,
  0x6c, 0xaa, 0xbf, 0xee, 0x95, 0xcc, 0x12, 0x24, 0x37, 0xeb, 0xda, 0x30, 0xdb, 0xe5, 0x4b, 0x34,
  0x5b, 0x56, 0x9e, 0x46, 0xeb, 0xe5, 0xb5, 0x75, 0x45, 0xac, 0xb7, 0xa2, 0x52, 0x69, 0x04, 0xd2,
  0x5f, 0x98, 0x59, 0x4f, 0xb6, 0xf3, 0x8e, 0x9f, 0x34, 0x8d, 0x07, 0x22, 0x7e, 0xc0, 0x28, 0x79,
  0xe1, 0x25, 0x0a, 0x03, 0x96, 0xb8, 0xa8, 0x0f, 0xc8, 0x37, 0x2d, 0xb0, 0xe8, 0xc0, 0x1e, 0x3b,
  0x4a, 0xf2, 0xcc, 0x6b, 0x60, 0x83, 0x88, 0x2d, 0x71, 0x8f, 0x91, 0xab, 0x1a, 0x02, 0x8e, 0x03,
  0xfb, 0xc2, 0x9a, 0x4e, 0x91, 0xd4, 0x49, 0x2c, 0x4c, 0x69, 0x8c, 0xe9, 0x4b, 0xbe, 0x88, 0xe2,
  0xd9, 0xa8, 0x7f, 0x3d, 0xe9, 0x67, 0x39, 0xd7, 0xd4, 0x11, 0xa0, 0xb1, 0xcd, 0x8b, 0x59, 0x5f,
  0xce, 0x35, 0x16, 0x26, 0x30, 0xe6, 0x19, 0x02, 0x81, 0x81, 0x00, 0x9b, 0x59, 0x44, 0x47, 0x26,
  0xa8, 0x10, 0x63, 0xfb, 0xf4, 0x8c, 0x27, 0xd6, 0x6e, 0x63, 0xa6, 0x78, 0x2c, 0x2c, 0x6d, 0xc3,
  0xe4, 0x91, 0xbd, 0x39, 0x78, 0xc6, 0x38, 0x6a, 0x9f, 0xa1, 0xad, 0x00, 0x64, 0xc2, 0xe2, 0xc8,
  0x47, 0x61, 0x71, 0xb4, 0x7b, 0x42, 0xe4, 0x76, 0x37, 0xf0, 0x69, 0x5d, 0xdf, 0x50, 0xcd, 0xbc,
  0x02, 0x41, 0x24, 0x03, 0x2f, 0x28, 0x73, 0xaa, 0x32, 0xc4, 0x70, 0xbd, 0x06, 0x30, 0x13, 0x67,
  0xd4, 0x4e, 0x9e, 0xce, 0xe0, 0xd7, 0x09, 0x18, 0x79, 0x51, 0xd0, 0x23, 0x4c, 0x9e, 0x64, 0x5d,
  0xca, 0x98, 0x1f, 0x22, 0x57, 0x51, 0xfb, 0x51, 0xdd, 0xc6, 0xd5, 0x68, 0xf8, 0x33, 0xfa, 0x90,
  0x0f, 0x77, 0xde, 0x1d, 0x69, 0xce, 0xce, 0xfd, 0x5b, 0x05, 0xea, 0x9a, 0xe8, 0x82, 0xd7, 0x9c,
  0x56, 0xb3, 0x02, 0x51, 0x22, 0x39, 0x03, 0x43, 0x89, 0xd0, 0xff, 0x02, 0x81, 0x80, 0x13, 0x1c,
  0x89, 0xc2, 0xb5, 0xde, 0x7e, 0xa5, 0xf4, 0x1c, 0xa8, 0x8d, 0xb3, 0x4f, 0x8a, 0x38, 0x9b, 0x57,
  0x33, 0xd6, 0x5d, 0xf2, 0xf1, 0x91, 0x05, 0x6e, 0x8b, 0x3a, 0xf7, 0x0b, 0xc8, 0x70, 0xa3, 0x0f,
  0x53, 0x4a, 0x1d, 0x89, 0x8f, 0x3f, 0xc9, 0xf9, 0xbf, 0x66, 0xc3, 0xf8, 0x1b, 0xf3, 0x6a, 0x69,
  0xc5, 0x1b, 0x1f, 0x3c, 0x94, 0xcf, 0xe3, 0xba, 0xed, 0xb6, 0x99, 0x48, 0x82, 0x13, 0x25, 0x86,
  0x5a, 0x15, 0xb1, 0xb1, 0x23, 0xb0, 0x84, 0x29, 0x57, 0x9e, 0xba, 0xa0, 0xa8, 0x76, 0xca, 0x9e,
  0xf1, 0xbc, 0xb6, 0xaf, 0xd0, 0x2a, 0x3a, 0xd8, 0xea, 0xc8, 0x5a, 0x9e, 0x32, 0x15, 0x4c, 0x88,
  0x1c, 0x12, 0x11, 0x72, 0x6c, 0x8b, 0xf9, 0xf9, 0x35, 0xf6, 0x42, 0x17, 0xf3, 0x95, 0xdf, 0xbd,
  0xc9, 0x55, 0x4f, 0x30, 0xba, 0xf8, 0xf6, 0xad, 0xb2, 0xfd, 0xbb, 0x36, 0x42, 0xe9, 0x02, 0x81,
  0x81, 0x00, 0xad, 0xf0, 0xc0, 0xfc, 0x55, 0x47, 0x8a, 0x03, 0x2b, 0x5c, 0x1c, 0x6e, 0xef, 0xf6,
  0x96, 0x68, 0xee, 0xa8, 0xd0, 0x6d, 0x70, 0x4f, 0x7f, 0x3e, 0x17, 0x2b, 0xfd, 0x7e, 0x22, 0x8c,
  0xea, 0x25, 0xe3, 0xbb, 0xa4, 0xa1, 0x57, 0xe7, 0x3e, 0xc0, 0x47, 0xf8, 0x7b, 0xa6, 0xd2, 0x48,
  0x68, 0xc0, 0x8a, 0xe0, 0xb2, 0x6b, 0x5d, 0xf9, 0x32, 0x6e, 0x70, 0x5a, 0xb9, 0x77, 0xd9, 0xbf,
  0x6d, 0xea, 0x53, 0xe2, 0x4f, 0xa8, 0x4c, 0x1c, 0xfa, 0x69, 0x49, 0x26, 0x48, 0x8a, 0xc5, 0x92,
  0x77, 0x6b, 0x7a, 0x89, 0xc3, 0xef, 0x6d, 0x1c, 0x44, 0x10, 0xe6, 0xaf, 0x47, 0x18, 0x9f, 0x99,
  0x09, 0xb4, 0x3b, 0x63, 0xf7, 0xbf, 0xe4, 0xe7, 0xe5, 0x98, 0xe2, 0x57, 0x85, 0xbb, 0x78, 0xb5,
  0xd1, 0xc3, 0x64, 0x8d, 0x4d, 0x4f, 0x02, 0xdb, 0x2c, 0x51, 0x58, 0xa3, 0xc7, 0x35, 0xf1, 0x2d,
  0x7a, 0x0a
]);

var CERT_DUMP = 
"Bv0C4AcxCAR0ZW1wCANLRVkIEWtzay0xNDE0MTk1Nzc5NjY1CAdJRC1DRVJUCAgA" +
"AAFJRKMe3BQDGAECFf0BcDCCAWwwIhgPMjAxNDEwMjUwMDA5NDFaGA8yMDM0MTAy" +
"MDAwMDk0MVowIDAeBgNVBCkTFy90ZW1wL2tzay0xNDE0MTk1Nzc5NjY1MIIBIjAN" +
"BgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA58yUcdGPsYx/+ZRwbrfdqeNyCIgJ" +
"bZ7tsV3XC4awJEOwWsEp6KWcihAdfUfFGOvB+q4IAbg0GrpuRlD7/RjMMfOVrOj5" +
"BmWvpW5unHUIZ4DNGsICH6f/e4DUvcCwxbXpJmtHRit2Pllep/4M62YZLKlaqQAJ" +
"kfXseVEzKSIBmeHu5fPBGNizFoZTG2mocAya5grWzMX5boBjHddAGXC5VswviAHM" +
"XcOUDre0+8Rg4BGl0Yt4DGuD2LcfijxCTGRJrT9M0ENKbxj8AMB6Grner0xN6thJ" +
"LW4VLHBVkOTrjx/4USImgw9xQd0m+CshY+R6HXVDSGQ0ckno9MNWOZPjHQIDAQAB" +
"Fi4bAQEcKQcnCAR0ZW1wCANLRVkIEWtzay0xNDE0MTk1Nzc5NjY1CAdJRC1DRVJU" +
"F/0BADWC/f623e3XZSQe5sLHKlHMa1eWmvaBmQrVLa1BvhyVdjbdujXSh2cMv9Wi" +
"qtVgALftzQpuhRA6wYX9PgP3A+0uGjjljKijuKDOWPPZodtWJqzDSt0UX4WU4hT5" +
"is4g4VdZ/aRc8x/z17QmUOdrN6yidLGKzx814JDy+npqZVXYYkcLgUu6o+3rddId" +
"DCp8sT/zjjGORj04Gh6qCp0QBEfNmZke8aI4DGor83AL5b9eDvWv3TtMNRzrWcF7" +
"NgvRyxKNDIXJZym0qpHQQVjdQJezWNxf82swBV2S7nbJCI4djOwbRTnRFuwi4vHs" +
"BmWVlUfyAg8noGdPRS8MGQs24vw=";

var identityStorage_;
var privateKeyStorage_;
var identityManager_;
var keyChain_;
var policyManager_;
var identityName_;
var keyName_;
var face_;

function getNowSeconds()
{
  var currentDate = new Date();
  return currentDate.getMilliseconds() / 1000.0;
}

// checkPolicyManager

describe ("TestPolicyMatching", function() {
  beforeEach(function() {
    identityStorage_ = new MemoryIdentityStorage();
    privateKeyStorage_ = new MemoryPrivateKeyStorage();

    identityManager_ = new IdentityManager(identityStorage_, privateKeyStorage_);  
    policyManager_ = new ConfigPolicyManager("policy_config/simple_rules.conf");    
    
    identityName_ = new Name("/TestConfigPolicyManager/temp");
    keyName_ = new Name(identityName_).append("ksk-1416010123");
    identityStorage_.addKey
      (keyName_, KeyType.RSA, new Blob(DEFAULT_RSA_PUBLIC_KEY_DER, false));
    privateKeyStorage_.setKeyPairForKeyName
      (keyName_, KeyType.RSA, DEFAULT_RSA_PUBLIC_KEY_DER, DEFAULT_RSA_PRIVATE_KEY_DER);
      
    var cert = identityManager_.selfSign(keyName_);
    
    identityStorage_.setDefaultKeyNameForIdentity(keyName_); 
    identityManager_.addCertificateAsDefault(cert);
    
    face_ = new Face("localhost");
    keyChain_ = new KeyChain(identityManager_, policyManager_);
  });
  
  afterEach(function() {
    face_.close();
  });
  
  it("NoVerify", function() {
    var policyManager = new NoVerifyPolicyManager();
    var identityName = new Name("TestValidator/Null").appendVersion(getNowSeconds());
    
    var keyChain = new KeyChain(identityManager_, policyManager);
    keyChain.createIdentityAndCertificate(identityName);
    var data = new Data(new Name(identityName).append("data"));
    keyChain.signByIdentity(data, identityName);
    
    var failureCount = 0;
    var successCount = 0;
    var vr = policyManager.checkVerificationPolicy(data, 0, 
      function() { ++successCount; }, function() { ++failureCount; });
      
    assert.equal(vr, null, "NoVerifyPolicyManager returned a ValidationRequest");
    assert.equal
      (failureCount, 0, "Verification failed with NoVerifyPolicyManager");
    assert.equal
      (successCount, 1, 
       "Verification success called " + successCount + " times instead of 1");
  });
  
  it("SelfVerification", function() {
    var policyManager = new SelfVerifyPolicyManager(identityStorage_);
    var identityName = new Name("TestValidator/RsaSignatureVerification");
    
    var keyChain = new KeyChain(identityManager_, policyManager);
    keyChain.createIdentityAndCertificate(identityName);
    
    var data = new Data(new Name("/TestData/1"));
    keyChain.signByIdentity(data, identityName);
    
    var failureCount = 0;
    var successCount = 0;
    var vr = policyManager.checkVerificationPolicy(data, 0, 
      function() { ++successCount; }, function() { ++failureCount; });
      
    assert.equal(vr, null, "SelfVerifyPolicyManager returned a ValidationRequest");
    assert.equal
      (failureCount, 0, "Verification of identity-signed data failed");
    assert.equal
      (successCount, 1, 
       "Verification success called " + successCount + " times instead of 1");
    
    data = new Data(new Name("/TestData/2"));
    // Make sure the locator is null in this empty Data, so it won't be encoded.
    // TODO: After removing NDNX support, delete this line.
    data.metaInfo.locator = null;
    
    failureCount = 0;
    successCount = 0;
    vr = policyManager.checkVerificationPolicy(data, 0, 
      function() { ++successCount; }, function() { ++failureCount; });
    
    assert.equal(vr, null, "SelfVerifyPolicyManager returned a ValidationRequest");
    assert.equal
      (successCount, 0, "Verification of unsigned data succeeded");
    assert.equal
      (failureCount, 1, 
       "Verification failure callback called " + failureCount + " times instead of 1");  
  });
  
  it("InterestTimestamp", function(done) {
    var interestName = new Name("/ndn/ucla/edu/something");
    var certName = identityManager_.getDefaultCertificateNameForIdentity(identityName_);
    face_.setCommandSigningInfo(keyChain_, certName);
    
    var oldInterest = new Interest(interestName);
    face_.makeCommandInterest(oldInterest);
    
    setTimeout(function() { 
      var newInterest = new Interest(interestName);
      face_.makeCommandInterest(newInterest);
    
      var failureCount = 0;
      var successCount = 0;
      var vr = policyManager_.checkVerificationPolicy(newInterest, 0,
        function() { ++successCount; }, function() { ++failureCount; });
    
      assert.equal
        (vr, null, "ConfigPolicyManager returned ValidationRequest but certificate is known");
      assert.equal
        (failureCount, 0, "Verification of valid interest failed");
      assert.equal
        (successCount, 1, 
         "Verification success called " + successCount + " times instead of 1");
    
      failureCount = 0;
      successCount = 0;
      vr = policyManager_.checkVerificationPolicy(oldInterest, 0,
        function() { ++successCount; }, function() { ++failureCount; });
    
      assert.equal
        (vr, null, "ConfigPolicyManager returned ValidationRequest but certificate is known");
      assert.equal
        (successCount, 0, "Verification of stale interest succeeded");
      assert.equal
        (failureCount, 1, 
         "Verification failure callback called " + failureCount + " times instead of 1");

      done();
    }, 100);
    
  });
  
  it("Refresh10s", function(done) {
    this.timeout(10000);

    var encodedData;
    encodedData = fs.readFileSync('policy_config/testData');

    var decodedData = new Buffer(encodedData.toString(), 'base64');
    var data = new Data();
    data.wireDecode(new Blob(decodedData));
    
    var failureCount = 0;
    var successCount = 0;
    var vr = policyManager_.checkVerificationPolicy(data, 0,
      function() { ++successCount; }, function() { ++failureCount; });

    assert.notEqual
      (vr, null, 
       "ConfigPolicyManager did not create ValidationRequest for unknown certificate");
    assert.equal
      (successCount, 0, 
       "ConfigPolicyManager called success callback with pending ValidationRequest");
    assert.equal
      (failureCount, 0, 
       "ConfigPolicyManager called failure callback with pending ValidationRequest");
    
    // Now save the cert data to our anchor directory, and wait.
    // We have to sign it with the current identity or the policy manager will
    //  create an interest for the signing certificate.
    var cert = new IdentityCertificate();
    var certData = new Buffer(CERT_DUMP, 'base64');

    cert.wireDecode(new Blob(certData));
    keyChain_.signByIdentity(cert, identityName_);
    
    var signedCertBlob = cert.wireEncode();
    var encodedCert = signedCertBlob.buf().toString('base64');
    fs.write
      (fs.openSync('policy_config/certs/testData.cert', 'w'), encodedCert);
    
    failureCount = 0;
    successCount = 0;
    vr = policyManager_.checkVerificationPolicy(data, 0,
      function() { ++successCount; }, function() { ++failureCount; });
   
    assert.notEqual
      (vr, null, "ConfigPolicyManager refresh occured sooner than specified");
    assert.equal
      (successCount, 0, 
       "ConfigPolicyManager called success callback with pending ValidationRequest");
    assert.equal
      (failureCount, 0, 
       "ConfigPolicyManager called failure callback with pending ValidationRequest");
    
    setTimeout(function() {
      failureCount = 0;
      successCount = 0;
      vr = policyManager_.checkVerificationPolicy(data, 0,
        function() { ++successCount; }, function() { ++failureCount; });
      
      // Delete testData.cert to make sure the correctness of reusing this test file.
      fs.unlinkSync('policy_config/certs/testData.cert');

      assert.equal
        (vr, null, "ConfigPolicyManager did not refresh certificate store");
      assert.equal
        (failureCount, 0, "ConfigPolicyManager did not verify valid signed data");
      assert.equal
        (successCount, 1, 
         "Verification success called " + successCount + " times instead of 1");

      done();
    }, 6000);
    
  });
  
});
