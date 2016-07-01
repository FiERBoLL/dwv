// namespaces
var dwv = dwv || {};
/** @namespace */
dwv.dicom = dwv.dicom || {};

/**
 * Clean string: trim and remove ending.
 * @param {String} string The string to clean.
 * @return {String} The cleaned string.
 */
dwv.dicom.cleanString = function (string)
{
    var res = string;
    if ( string ) {
        // trim spaces
        res = string.trim();
        // get rid of ending zero-width space (u200B)
        if ( res[res.length-1] === String.fromCharCode("u200B") ) {
            res = res.substring(0, res.length-1);
        }
    }
    return res;
};

/**
 * Is the Native endianness Little Endian.
 * @type Boolean
 */
dwv.dicom.isNativeLittleEndian = function ()
{
    return new Int8Array(new Int16Array([1]).buffer)[0] > 0;
};

/**
 * Data reader.
 * @constructor
 * @param {Array} buffer The input array buffer.
 * @param {Boolean} isLittleEndian Flag to tell if the data is little or big endian.
 */
dwv.dicom.DataReader = function (buffer, isLittleEndian)
{
    // Set endian flag if not defined.
    if ( typeof isLittleEndian === 'undefined' ) {
        isLittleEndian = true;
    }

    /**
     * Is the Native endianness Little Endian.
     * @private
     * @type Boolean
     */
    var isNativeLittleEndian = dwv.dicom.isNativeLittleEndian();

    /**
     * Flag to know if the TypedArray data needs flipping.
     * @private
     * @type Boolean
     */
    var needFlip = (isLittleEndian !== isNativeLittleEndian);

    /**
     * The main data view.
     * @private
     * @type DataView
     */
    var view = new DataView(buffer);

    /**
     * Flip an array's endianness.
     * Inspired from [DataStream.js]{@link https://github.com/kig/DataStream.js}.
     * @param {Object} array The array to flip (modified).
     */
    this.flipArrayEndianness = function (array) {
       var blen = array.byteLength;
       var u8 = new Uint8Array(array.buffer, array.byteOffset, blen);
       var bpel = array.BYTES_PER_ELEMENT;
       var tmp;
       for ( var i = 0; i < blen; i += bpel ) {
         for ( var j = i + bpel - 1, k = i; j > k; j--, k++ ) {
           tmp = u8[k];
           u8[k] = u8[j];
           u8[j] = tmp;
         }
       }
    };

    /**
     * Read Uint16 (2 bytes) data.
     * @param {Number} byteOffset The offset to start reading from.
     * @return {Number} The read data.
     */
    this.readUint16 = function (byteOffset) {
        return view.getUint16(byteOffset, isLittleEndian);
    };
    /**
     * Read Uint32 (4 bytes) data.
     * @param {Number} byteOffset The offset to start reading from.
     * @return {Number} The read data.
     */
    this.readUint32 = function (byteOffset) {
        return view.getUint32(byteOffset, isLittleEndian);
    };
    /**
     * Read Int32 (4 bytes) data.
     * @param {Number} byteOffset The offset to start reading from.
     * @return {Number} The read data.
     */
    this.readInt32 = function (byteOffset) {
        return view.getInt32(byteOffset, isLittleEndian);
    };
    /**
     * Read Uint8 array.
     * @param {Number} byteOffset The offset to start reading from.
     * @param {Number} size The size of the array.
     * @return {Array} The read data.
     */
    this.readUint8Array = function (byteOffset, size) {
        return new Uint8Array(buffer, byteOffset, size);
    };
    /**
     * Read Int8 array.
     * @param {Number} byteOffset The offset to start reading from.
     * @param {Number} size The size of the array.
     * @return {Array} The read data.
     */
    this.readInt8Array = function (byteOffset, size) {
        return new Int8Array(buffer, byteOffset, size);
    };
    /**
     * Read Uint16 array.
     * @param {Number} byteOffset The offset to start reading from.
     * @param {Number} size The size of the array.
     * @return {Array} The read data.
     */
    this.readUint16Array = function (byteOffset, size) {
        var arraySize = size / Uint16Array.BYTES_PER_ELEMENT;
        var data = null;
        // byteOffset should be a multiple of Uint16Array.BYTES_PER_ELEMENT (=2)
        if ( (byteOffset % Uint16Array.BYTES_PER_ELEMENT) === 0 ) {
            data = new Uint16Array(buffer, byteOffset, arraySize);
            if ( needFlip ) {
                this.flipArrayEndianness(data);
            }
        }
        else {
            data = new Uint16Array(arraySize);
            for ( var i = 0; i < arraySize; ++i ) {
                data[i] = view.getInt16(
                        (byteOffset + Uint16Array.BYTES_PER_ELEMENT * i), 
                        isLittleEndian);
            }
        }
        return data;
    };
    /**
     * Read Int16 array.
     * @param {Number} byteOffset The offset to start reading from.
     * @param {Number} size The size of the array.
     * @return {Array} The read data.
     */
    this.readInt16Array = function (byteOffset, size) {
        var arraySize = size / Int16Array.BYTES_PER_ELEMENT;
        var data = null;
        // byteOffset should be a multiple of Int16Array.BYTES_PER_ELEMENT (=2)
        if ( (byteOffset % Int16Array.BYTES_PER_ELEMENT) === 0 ) {
            data = new Int16Array(buffer, byteOffset, arraySize);
            if ( needFlip ) {
                this.flipArrayEndianness(data);
            }
        }
        else {
            data = new Int16Array(arraySize);
            for ( var i = 0; i < arraySize; ++i ) {
                data[i] = view.getInt16(
                        (byteOffset + Int16Array.BYTES_PER_ELEMENT * i),
                        isLittleEndian);
            }
        }
        return data;
    };
    /**
     * Read Uint32 array.
     * @param {Number} byteOffset The offset to start reading from.
     * @param {Number} size The size of the array.
     * @return {Array} The read data.
     */
    this.readUint32Array = function (byteOffset, size) {
        var arraySize = size / Uint32Array.BYTES_PER_ELEMENT;
        var data = null;
        // byteOffset should be a multiple of Uint32Array.BYTES_PER_ELEMENT (=4)
        if ( (byteOffset % Uint32Array.BYTES_PER_ELEMENT) === 0 ) {
            data = new Uint32Array(buffer, byteOffset, arraySize);
            if ( needFlip ) {
                this.flipArrayEndianness(data);
            }
        }
        else {
            data = new Uint32Array(arraySize);
            for ( var i = 0; i < arraySize; ++i ) {
                data[i] = view.getUint32(
                        (byteOffset + Uint32Array.BYTES_PER_ELEMENT * i),
                        isLittleEndian);
            }
        }
        return data;
    };
    /**
     * Read Int32 array.
     * @param {Number} byteOffset The offset to start reading from.
     * @param {Number} size The size of the array.
     * @return {Array} The read data.
     */
    this.readInt32Array = function (byteOffset, size) {
        var arraySize = size / Int32Array.BYTES_PER_ELEMENT;
        var data = null;
        // byteOffset should be a multiple of Int32Array.BYTES_PER_ELEMENT (=4)
        if ( (byteOffset % Int32Array.BYTES_PER_ELEMENT) === 0 ) {
            data = new Int32Array(buffer, byteOffset, arraySize);
            if ( needFlip ) {
                this.flipArrayEndianness(data);
            }
        }
        else {
            data = new Int32Array(arraySize);
            for ( var i = 0; i < arraySize; ++i ) {
                data[i] = view.getInt32(
                        (byteOffset + Int32Array.BYTES_PER_ELEMENT * i),
                        isLittleEndian);
            }
        }
        return data;
    };
    /**
     * Read Float32 array.
     * @param {Number} byteOffset The offset to start reading from.
     * @param {Number} size The size of the array.
     * @return {Array} The read data.
     */
    this.readFloat32Array = function (byteOffset, size) {
        var arraySize = size / Float32Array.BYTES_PER_ELEMENT;
        var data = null;
        // byteOffset should be a multiple of Float32Array.BYTES_PER_ELEMENT (=4)
        if ( (byteOffset % Float32Array.BYTES_PER_ELEMENT) === 0 ) {
            data = new Float32Array(buffer, byteOffset, arraySize);
            if ( needFlip ) {
                this.flipArrayEndianness(data);
            }
        }
        else {
            data = new Float32Array(arraySize);
            for ( var i = 0; i < arraySize; ++i ) {
                data[i] = view.getFloat32(
                        (byteOffset + Float32Array.BYTES_PER_ELEMENT * i), 
                        isLittleEndian);
            }
        }
        return data;
    };
    /**
     * Read Float64 array.
     * @param {Number} byteOffset The offset to start reading from.
     * @param {Number} size The size of the array.
     * @return {Array} The read data.
     */
    this.readFloat64Array = function (byteOffset, size) {
        var arraySize = size / Float64Array.BYTES_PER_ELEMENT;
        var data = null;
        // byteOffset should be a multiple of Float64Array.BYTES_PER_ELEMENT (=8)
        if ( (byteOffset % Float64Array.BYTES_PER_ELEMENT) === 0 ) {
            data = new Float64Array(buffer, byteOffset, arraySize);
            if ( needFlip ) {
                this.flipArrayEndianness(data);
            }
        }
        else {
            data = new Float64Array(arraySize);
            for ( var i = 0; i < arraySize; ++i ) {
                data[i] = view.getFloat64(
                        (byteOffset + Float64Array.BYTES_PER_ELEMENT*i),
                        isLittleEndian);
            }
        }
        return data;
    };
    /**
     * Read data as an hexadecimal string.
     * @param {Number} byteOffset The offset to start reading from.
     * @return {Array} The read data.
     */
    this.readHex = function (byteOffset) {
        // read and convert to hex string
        var str = this.readUint16(byteOffset).toString(16);
        // return padded
        return "0x0000".substr(0, 6 - str.length) + str.toUpperCase();
    };
    /**
     * Read data as a string.
     * @param {Number} byteOffset The offset to start reading from.
     * @param {Number} nChars The number of characters to read.
     * @return {String} The read data.
     */
    this.readString = function (byteOffset, nChars) {
        var result = "";
        var data = this.readUint8Array(byteOffset, nChars);
        for ( var i = 0; i < nChars; ++i ) {
            result += String.fromCharCode( data[ i ] );
        }
        return result;
    };
};

/**
 * Get the group-element key used to store DICOM elements.
 * @param {Number} group The DICOM group.
 * @param {Number} element The DICOM element.
 * @return {String} The key.
 */
dwv.dicom.getGroupElementKey = function (group, element)
{
    return 'x' + group.substr(2,6) + element.substr(2,6);
};

/**
 * Split a group-element key used to store DICOM elements.
 * @param {String} key The key in form "x00280102.
 * @return {Object} The DICOM group and element.
 */
dwv.dicom.splitGroupElementKey = function (key)
{
    return {'group': key.substr(1,4), 'element': key.substr(5,8) };
};

/**
 * Tell if a given syntax is a JPEG baseline one.
 * @param {String} syntax The transfer syntax to test.
 * @return {Boolean} True if a jpeg baseline syntax.
 */
dwv.dicom.isJpegBaselineTransferSyntax = function (syntax)
{
    return syntax === "1.2.840.10008.1.2.4.50" ||
        syntax === "1.2.840.10008.1.2.4.51";
};

/**
 * Tell if a given syntax is a non supported JPEG one.
 * @param {String} syntax The transfer syntax to test.
 * @return {Boolean} True if a non supported jpeg syntax.
 */
dwv.dicom.isJpegNonSupportedTransferSyntax = function (syntax)
{
    return ( syntax.match(/1.2.840.10008.1.2.4.5/) !== null &&
        !dwv.dicom.isJpegBaselineTransferSyntax() &&
        !dwv.dicom.isJpegLosslessTransferSyntax() ) ||
        syntax.match(/1.2.840.10008.1.2.4.6/) !== null;
};

/**
 * Tell if a given syntax is a JPEG Lossless one.
 * @param {String} syntax The transfer syntax to test.
 * @return {Boolean} True if a jpeg lossless syntax.
 */
dwv.dicom.isJpegLosslessTransferSyntax = function (syntax)
{
    return syntax === "1.2.840.10008.1.2.4.57" ||
        syntax === "1.2.840.10008.1.2.4.70";
};

/**
 * Tell if a given syntax is a JPEG-LS one.
 * @param {String} syntax The transfer syntax to test.
 * @return {Boolean} True if a jpeg-ls syntax.
 */
dwv.dicom.isJpeglsTransferSyntax = function (syntax)
{
    return syntax.match(/1.2.840.10008.1.2.4.8/) !== null;
};

/**
 * Tell if a given syntax is a JPEG 2000 one.
 * @param {String} syntax The transfer syntax to test.
 * @return {Boolean} True if a jpeg 2000 syntax.
 */
dwv.dicom.isJpeg2000TransferSyntax = function (syntax)
{
    return syntax.match(/1.2.840.10008.1.2.4.9/) !== null;
};

/**
 * Tell if a given syntax needs decompression.
 * @param {String} syntax The transfer syntax to test.
 * @return {String} The name of the decompression algorithm.
 */
dwv.dicom.getSyntaxDecompressionName = function (syntax)
{
    var algo = null;
    if ( dwv.dicom.isJpeg2000TransferSyntax(syntax) ) {
        algo = "jpeg2000";
    }
    else if ( dwv.dicom.isJpegBaselineTransferSyntax(syntax) ) {
        algo = "jpeg-baseline";
    }
    else if ( dwv.dicom.isJpegLosslessTransferSyntax(syntax) ) {
        algo = "jpeg-lossless";
    }
    return algo;
};

/**
 * Get the transfer syntax name.
 * Reference: [UID Values]{@link http://dicom.nema.org/dicom/2013/output/chtml/part06/chapter_A.html}.
 * @param {String} syntax The transfer syntax.
 * @return {String} The name of the transfer syntax.
 */
dwv.dicom.getTransferSyntaxName = function (syntax)
{
    var name = "unknown";
    // Implicit VR - Little Endian
    if( syntax === "1.2.840.10008.1.2" ) {
        name = "Little Endian Implicit";
    }
    // Explicit VR - Little Endian
    else if( syntax === "1.2.840.10008.1.2.1" ) {
        name = "Little Endian Explicit";
    }
    // Deflated Explicit VR - Little Endian
    else if( syntax === "1.2.840.10008.1.2.1.99" ) {
        name = "Little Endian Deflated Explicit";
    }
    // Explicit VR - Big Endian
    else if( syntax === "1.2.840.10008.1.2.2" ) {
        name = "Big Endian Explicit";
    }
    // JPEG baseline
    else if( dwv.dicom.isJpegBaselineTransferSyntax(syntax) ) {
        if ( syntax === "1.2.840.10008.1.2.4.50" ) {
            name = "JPEG Baseline";
        }
        else { // *.51
            name = "JPEG Extended, Process 2+4";
        }
    }
    // JPEG Lossless
    else if( dwv.dicom.isJpegLosslessTransferSyntax(syntax) ) {
        if ( syntax === "1.2.840.10008.1.2.4.57" ) {
            name = "JPEG Lossless, Nonhierarchical (Processes 14)";
        }
        else { // *.70
            name = "JPEG Lossless, Non-hierarchical, 1st Order Prediction";
        }
    }
    // Non supported JPEG
    else if( dwv.dicom.isJpegNonSupportedTransferSyntax(syntax) ) {
        name = "Non supported JPEG";
    }
    // JPEG-LS
    else if( dwv.dicom.isJpeglsTransferSyntax(syntax) ) {
        name = "JPEG-LS";
    }
    // JPEG 2000
    else if( dwv.dicom.isJpeg2000TransferSyntax(syntax) ) {
        if ( syntax === "1.2.840.10008.1.2.4.91" ) {
            name = "JPEG 2000 (Lossless or Lossy)";
        }
        else { // *.90
            name = "JPEG 2000 (Lossless only)";
        }
    }
    // MPEG2 Image Compression
    else if( syntax === "1.2.840.10008.1.2.4.100" ) {
        name = "MPEG2";
    }
    // RLE (lossless)
    else if( syntax === "1.2.840.10008.1.2.5" ) {
        name = "RLE";
    }
    // return
    return name;
};

/**
 * Does this Value Representation (VR) have a 32bit Value Length (VL).
 * Ref: [Data Element explicit]{@link http://dicom.nema.org/dicom/2013/output/chtml/part05/chapter_7.html#table_7.1-1}.
 * @param {String} vr The data Value Representation (VR).
 * @returns {Boolean} True if this VR has a 32-bit VL.
 */
dwv.dicom.is32bitVLVR = function (vr)
{
    // added locally used 'ox'
    return ( vr === "OB" || vr === "OW" || vr === "OF" || vr === "ox" ||
            vr === "SQ" || vr === "UN" );
};

/**
 * Does this tag have a VR. 
 * Basically the Item, ItemDelimitationItem and SequenceDelimitationItem tags.
 * @param {String} group The tag group.
 * @param {String} element The tag element.
 * @returns {Boolean} True if this tar has a VR.
 */
dwv.dicom.isTagWithVR = function (group, element) {
    return !(group === "0xFFFE" &&
            (element === "0xE000" || element === "0xE00D" || element === "0xE0DD" ));
};


/**
 * Get the number of bytes occupied by a data element prefix, i.e. without its value.
 * WARNING: this is valid for tags with a VR, if not sure use the 'isTagWithVR' function first.
 * Reference:
 * - [Data Element explicit]{@link http://dicom.nema.org/dicom/2013/output/chtml/part05/chapter_7.html#table_7.1-1},
 * - [Data Element implicit]{@link http://dicom.nema.org/dicom/2013/output/chtml/part05/sect_7.5.html#table_7.5-1}.
 *
 * | Tag | VR  | VL | Value |
 * | 4   | 2   | 2  | X     | -> regular explicit: 8 + X
 * | 4   | 2+2 | 4  | X     | -> 32bit VL: 12 + X
 * 
 * | Tag | VL | Value |
 * | 4   | 4  | X     | -> implicit (32bit VL): 8 + X
 * 
 * | Tag | Len | Value |
 * | 4   | 4   | X     | -> item: 8 + X
 */
dwv.dicom.getDataElementPrefixByteSize = function (vr) {
    return dwv.dicom.is32bitVLVR(vr) ? 12 : 8;
};

/**
 * DicomParser class.
 * @constructor
 */
dwv.dicom.DicomParser = function ()
{
    /**
     * The list of DICOM elements.
     * @type Array
     */
    this.dicomElements = {};
    /**
     * The pixel buffer.
     * @type Array
     */
    this.pixelBuffer = [];

    /**
     * Unknown tags count.
     * @type Number
     */
    var unknownCount = 0;
    /**
     * Get the next unknown tags count.
     * @return {Number} The next count.
     */
    this.getNextUnknownCount = function () {
        unknownCount++;
        return unknownCount;
    };
};

/**
 * Get the raw DICOM data elements.
 * @return {Object} The raw DICOM elements.
 */
dwv.dicom.DicomParser.prototype.getRawDicomElements = function ()
{
    return this.dicomElements;
};

/**
 * Get the DICOM data elements.
 * @return {Object} The DICOM elements.
 */
dwv.dicom.DicomParser.prototype.getDicomElements = function ()
{
    return new dwv.dicom.DicomElementsWrapper(this.dicomElements);
};

/**
 * Get the DICOM data pixel buffer.
 * @return {Array} The pixel buffer.
 */
dwv.dicom.DicomParser.prototype.getPixelBuffer = function ()
{
    return this.pixelBuffer;
};

/**
 * Read a DICOM tag.
 * @param reader The raw data reader.
 * @param offset The offset where to start to read.
 * @return An object containing the tags 'group', 'element' and 'name'.
 */
dwv.dicom.DicomParser.prototype.readTag = function (reader, offset)
{
    // group
    var group = reader.readHex(offset);
    offset += Uint16Array.BYTES_PER_ELEMENT;
    // element
    var element = reader.readHex(offset);
    offset += Uint16Array.BYTES_PER_ELEMENT;
    // name
    var name = dwv.dicom.getGroupElementKey(group, element);
    // return
    return {
        'group': group, 
        'element': element,
        'name': name,
        'endOffset': offset };
};

/**
 * Read an item data element.
 * @param {Object} reader The raw data reader.
 * @param {Number} offset The offset where to start to read.
 * @param {Boolean} implicit Is the DICOM VR implicit?
 * @returns {Object} The item data as a list of data elements.
 */
dwv.dicom.DicomParser.prototype.readItemDataElement = function (reader, offset, implicit)
{
    var itemData = {};

    // read the first item
    var item = this.readDataElement(reader, offset, implicit);
    offset = item.endOffset;
    
    // exit if it is a sequence delimitation item
    var isSeqDelim = ( item.tag.name === "xFFFEE0DD" );
    if (isSeqDelim) {
        return {
            data: itemData, 
            endOffset: item.endOffset, 
            isSeqDelim: isSeqDelim };
    }
    
    // store it
    itemData[item.tag.name] = item;
    
    // explicit VR items
    if (item.vl !== "u/l") {
        // not empty
        if (item.vl !== 0) {
            // read until the end offset
            var endOffset = offset;
            offset -= item.vl;
            while (offset < endOffset) {
                item = this.readDataElement(reader, offset, implicit);
                offset = item.endOffset; 
                itemData[item.tag.name] = item;
            }
        }
    }
    // implicit VR items
    else {
        // read until the item delimitation item
        var isItemDelim = false;
        while (!isItemDelim) {
            item = this.readDataElement(reader, offset, implicit);
            offset = item.endOffset; 
            isItemDelim = ( item.tag.name === "xFFFEE00D" );
            if (!isItemDelim) {
                itemData[item.tag.name] = item;
            }
        }
    }
    
    return {
        'data': itemData, 
        'endOffset': offset, 
        'isSeqDelim': false };
};

/**
 * Read the pixel item data element. 
 * Ref: [Single frame fragments]{@link http://dicom.nema.org/dicom/2013/output/chtml/part05/sect_A.4.html#table_A.4-1}.
 * @param {Object} reader The raw data reader.
 * @param {Number} offset The offset where to start to read.
 * @param {Boolean} implicit Is the DICOM VR implicit?
 * @returns {Array} The item data as an array of data elements.
 */
dwv.dicom.DicomParser.prototype.readPixelItemDataElement = function (reader, offset, implicit)
{
    var itemData = [];

    // first item: basic offset table
    var item = this.readDataElement(reader, offset, implicit);
    offset = item.endOffset;
    
    // read until the sequence delimitation item
    var isSeqDelim = false;
    while (!isSeqDelim) {
        item = this.readDataElement(reader, offset, implicit);
        offset = item.endOffset; 
        isSeqDelim = ( item.tag.name === "xFFFEE0DD" );
        if (!isSeqDelim) {
            itemData.push(item);
        }
    }
    
    return {
        'data': itemData, 
        'endOffset': offset };
};

/**
 * Read a DICOM data element.
 * Reference: [DICOM VRs]{@link http://dicom.nema.org/dicom/2013/output/chtml/part05/sect_6.2.html#table_6.2-1}.
 * @param {Object} reader The raw data reader.
 * @param {Number} offset The offset where to start to read.
 * @param {Boolean} implicit Is the DICOM VR implicit?
 * @return {Object} An object containing the element 'tag', 'vl', 'vr', 'data' and 'endOffset'.
 */
dwv.dicom.DicomParser.prototype.readDataElement = function (reader, offset, implicit)
{
    // Tag: group, element
    var tag = this.readTag(reader, offset);
    offset = tag.endOffset;

    // Value Representation (VR)
    var vr = null; 
    var is32bitVLVR = false;
    if (dwv.dicom.isTagWithVR(tag.group, tag.element)) {
        // implicit VR
        if (implicit) {
            vr = "UN";
            var dict = dwv.dicom.dictionary;
            if ( typeof dict[tag.group] !== "undefined" &&
                    typeof dict[tag.group][tag.element] !== "undefined" ) {
                vr = dwv.dicom.dictionary[tag.group][tag.element][0];
            }
            is32bitVLVR = true;
        }
        else {
            vr = reader.readString( offset, 2 );
            offset += 2 * Uint8Array.BYTES_PER_ELEMENT;
            is32bitVLVR = dwv.dicom.is32bitVLVR(vr);
            // reserved 2 bytes
            if ( is32bitVLVR ) {
                offset += 2 * Uint8Array.BYTES_PER_ELEMENT;
            }
        }
    }
    else {
        vr = "UN";
        is32bitVLVR = true;
    }

    // Value Length (VL)
    var vl = 0;
    if ( is32bitVLVR ) {
        vl = reader.readUint32( offset );
        offset += Uint32Array.BYTES_PER_ELEMENT;
    }
    else {
        vl = reader.readUint16( offset );
        offset += Uint16Array.BYTES_PER_ELEMENT;
    }
    
    // check the value of VL
    var vlString = vl;
    if( vl === 0xffffffff ) {
        vlString = "u/l";
        vl = 0;
    }

    // data
    var data = null;
    // pixel data sequence (implicit)
    if (tag.name === "x7FE00010" && vlString === "u/l")
    {
        var pixItemData = this.readPixelItemDataElement(reader, offset, implicit);
        offset = pixItemData.endOffset;
        data = pixItemData.data;
    }
    else if ( vr === "OW" || vr === "OF" || vr === "ox" )
    {
        // BitsAllocated == 8
        if ( typeof this.dicomElements.x00280100 !== 'undefined' &&
                    this.dicomElements.x00280100.value[0] === 8 ) {
            data = reader.readUint8Array( offset, vl );
            offset += vl;
        }
        else {
            data = reader.readUint16Array( offset, vl );
            offset += vl;
        }
    }
    // OB
    else if( vr === "OB")
    {
        data = reader.readUint8Array( offset, vl );
        offset += vl;
    }
    // numbers
    else if( vr === "US")
    {
        data = reader.readUint16Array( offset, vl );
        offset += vl;
    }
    else if( vr === "UL")
    {
        data = reader.readUint32Array( offset, vl );
        offset += vl;
    }
    else if( vr === "SS")
    {
        data = reader.readInt16Array( offset, vl );
        offset += vl;
    }
    else if( vr === "SL")
    {
        data = reader.readInt32Array( offset, vl );
        offset += vl;
    }
    else if( vr === "FL")
    {
        data = reader.readFloat32Array( offset, vl );
        offset += vl;
    }
    else if( vr === "FD")
    {
        data = reader.readFloat64Array( offset, vl );
        offset += vl;
    }
    // attribute
    else if( vr === "AT")
    {
        var raw = reader.readUint16Array( offset, vl );
        offset += vl;
        data = [];
        for ( var i = 0; i < raw.length; i+=2 ) {
            var stri = raw[i].toString(16);
            var stri1 = raw[i+1].toString(16);
            var str = "(";
            str += "0000".substr(0, 4 - stri.length) + stri.toUpperCase();
            str += ",";
            str += "0000".substr(0, 4 - stri1.length) + stri1.toUpperCase();
            str += ")";
            data.push(str);
        }
    }
    // not available
    else if( vr === "UN")
    {
        data = reader.readUint8Array( offset, vl );
        offset += vl;
    }
    // sequence
    else if (vr === "SQ")
    {
        data = [];
        var itemData;
        // explicit VR sequence
        if (vlString !== "u/l") {
            // not empty
            if (vl !== 0) {
                var sqEndOffset = offset + vl;
                while (offset < sqEndOffset) {
                     itemData = this.readItemDataElement(reader, offset, implicit);
                     data.push( itemData.data );
                     offset = itemData.endOffset;
                }
            }
        }
        // implicit VR sequence
        else {
            // read until the sequence delimitation item
            var isSeqDelim = false;
            while (!isSeqDelim) {
                itemData = this.readItemDataElement(reader, offset, implicit);
                isSeqDelim = itemData.isSeqDelim;
                offset = itemData.endOffset;
                // do not store the delimitation item
                if (!isSeqDelim) {
                    data.push( itemData.data );
                }
            }
        }
    }
    // raw
    else
    {
        data = reader.readString( offset, vl);
        offset += vl;
        data = data.split("\\");
    }

    // return
    return {
        'tag': tag,
        'vr': vr,
        'vl': vlString,
        'value': data,
        'endOffset': offset
    };
};

/**
 * Parse the complete DICOM file (given as input to the class).
 * Fills in the member object 'dicomElements'.
 * @param buffer The input array buffer.
 */
dwv.dicom.DicomParser.prototype.parse = function (buffer)
{
    var offset = 0;
    var implicit = false;
    // default readers
    var metaReader = new dwv.dicom.DataReader(buffer);
    var dataReader = new dwv.dicom.DataReader(buffer);

    // 128 -> 132: magic word
    offset = 128;
    var magicword = metaReader.readString( offset, 4 );
    offset += 4 * Uint8Array.BYTES_PER_ELEMENT;
    if(magicword !== "DICM")
    {
        throw new Error("Not a valid DICOM file (no magic DICM word found)");
    }

    // 0x0002, 0x0000: FileMetaInformationGroupLength
    var dataElement = this.readDataElement(metaReader, offset);
    offset = dataElement.endOffset;
    // store the data element
    this.dicomElements[dataElement.tag.name] = dataElement;
    // get meta length
    var metaLength = parseInt(dataElement.value[0], 10);

    // meta elements
    var metaEnd = offset + metaLength;
    while( offset < metaEnd )
    {
        // get the data element
        dataElement = this.readDataElement(metaReader, offset, false);
        offset = dataElement.endOffset;
        // store the data element
        this.dicomElements[dataElement.tag.name] = dataElement;
    }

    // check the TransferSyntaxUID (has to be there!)
    var syntax = dwv.dicom.cleanString(this.dicomElements.x00020010.value[0]);

    // Explicit VR - Little Endian
    if( syntax === "1.2.840.10008.1.2.1" ) {
        // nothing to do!
    }
    // Implicit VR - Little Endian
    else if( syntax === "1.2.840.10008.1.2" ) {
        implicit = true;
    }
    // Deflated Explicit VR - Little Endian
    else if( syntax === "1.2.840.10008.1.2.1.99" ) {
        throw new Error("Unsupported DICOM transfer syntax (Deflated Explicit VR): "+syntax);
    }
    // Explicit VR - Big Endian
    else if( syntax === "1.2.840.10008.1.2.2" ) {
        dataReader = new dwv.dicom.DataReader(buffer,false);
    }
    // JPEG baseline
    else if( dwv.dicom.isJpegBaselineTransferSyntax(syntax) ) {
        // nothing to do!
    }
    // JPEG Lossless
    else if( dwv.dicom.isJpegLosslessTransferSyntax(syntax) ) {
        // nothing to do!
    }
    // non supported JPEG
    else if( dwv.dicom.isJpegNonSupportedTransferSyntax(syntax) ) {
        throw new Error("Unsupported DICOM transfer syntax (retired JPEG): "+syntax);
    }
    // JPEG-LS
    else if( dwv.dicom.isJpeglsTransferSyntax(syntax) ) {
        throw new Error("Unsupported DICOM transfer syntax (JPEG-LS): "+syntax);
    }
    // JPEG 2000
    else if( dwv.dicom.isJpeg2000TransferSyntax(syntax) ) {
        // nothing to do!
    }
    // MPEG2 Image Compression
    else if( syntax === "1.2.840.10008.1.2.4.100" ) {
        throw new Error("Unsupported DICOM transfer syntax (MPEG2): "+syntax);
    }
    // RLE (lossless)
    else if( syntax === "1.2.840.10008.1.2.5" ) {
        throw new Error("Unsupported DICOM transfer syntax (RLE): "+syntax);
    }
    else {
        throw new Error("Unknown transfer syntax: "+syntax);
    }

    // DICOM data elements
    while ( offset < buffer.byteLength )
    {
        // get the data element
        dataElement = this.readDataElement(dataReader, offset, implicit);
        // increment offset
        offset = dataElement.endOffset;
        // store the data element
        this.dicomElements[dataElement.tag.name] = dataElement;
    }
    
    // pixel buffer
    if (typeof this.dicomElements.x7FE00010 !== "undefined") {
        if (this.dicomElements.x7FE00010.vl !== "u/l") {
            this.pixelBuffer = this.dicomElements.x7FE00010.value;
        }
        else {
            // concatenate pixel data items
            // concat does not work on typed arrays
            //this.pixelBuffer = this.pixelBuffer.concat( dataElement.data );
            // manual concat...
            var items = this.dicomElements.x7FE00010.value;
            for (var i = 0; i < items.length; ++i) {
                var size = items[i].value.length + this.pixelBuffer.length;
                var newBuffer = new Uint16Array(size);
                newBuffer.set( this.pixelBuffer, 0 );
                newBuffer.set( items[i].value, this.pixelBuffer.length );
                this.pixelBuffer = newBuffer;
            }
        }
    }
};

/**
 * DicomElements wrapper.
 * @constructor
 * @param {Array} dicomElements The elements to wrap.
 */
dwv.dicom.DicomElementsWrapper = function (dicomElements) {

    /**
    * Get a DICOM Element value from a group/element key.
    * @param {String} groupElementKey The key to retrieve.
    * @param {Boolean} asArray Get the value as an Array.
    * @return {Object} The DICOM element value.
    */
    this.getFromKey = function ( groupElementKey, asArray ) {
        // default
        if ( typeof asArray === "undefined" ) {
            asArray = false;
        }
        var value = null;
        var dElement = dicomElements[groupElementKey];
        if ( typeof dElement !== "undefined" ) {
            // raw value if only one
            if ( dElement.value.length === 1 && asArray === false) {
                value = dElement.value[0];
            }
            else {
                value = dElement.value;
            }
        }
        return value;
    };

    /**
     * Dump the DICOM tags to an array.
     * @return {Array}
     */
    this.dumpToTable = function () {
        var keys = Object.keys(dicomElements);
        var dict = dwv.dicom.dictionary;
        var table = [];
        var dicomElement = null;
        var dictElement = null;
        var row = null;
        for ( var i = 0 ; i < keys.length; ++i ) {
            dicomElement = dicomElements[keys[i]];
            row = {};
            // dictionnary entry (to get name)
            dictElement = null;
            if ( typeof dict[dicomElement.tag.group] !== "undefined" &&
                    typeof dict[dicomElement.tag.group][dicomElement.tag.element] !== "undefined") {
                dictElement = dict[dicomElement.tag.group][dicomElement.tag.element];
            }
            // name
            if ( dictElement !== null ) {
                row.name = dictElement[2];
            }
            else {
                row.name = "Unknown Tag & Data";
            }
            // value
            if ( dicomElement.tag.name !== "x7FE00010" ) {
                row.value = dicomElement.value;
            }
            else {
                row.value = "...";
            }
            // others
            row.group = dicomElement.tag.group;
            row.element = dicomElement.tag.element;
            row.vr = dicomElement.vr;
            row.vl = dicomElement.vl;

            table.push( row );
        }
        return table;
    };

    /**
     * Dump the DICOM tags to a string.
     * @return {String} The dumped file.
     */
    this.dump = function () {
        var keys = Object.keys(dicomElements);
        var result = "\n";
        result += "# Dicom-File-Format\n";
        result += "\n";
        result += "# Dicom-Meta-Information-Header\n";
        result += "# Used TransferSyntax: ";
        if ( dwv.dicom.isNativeLittleEndian() ) {
            result += "Little Endian Explicit\n";
        }
        else {
            result += "NOT Little Endian Explicit\n";
        }
        var dicomElement = null;
        var checkHeader = true;
        for ( var i = 0 ; i < keys.length; ++i ) {
            dicomElement = dicomElements[keys[i]];
            if ( checkHeader && dicomElement.tag.group !== "0x0002" ) {
                result += "\n";
                result += "# Dicom-Data-Set\n";
                result += "# Used TransferSyntax: ";
                var syntax = dwv.dicom.cleanString(dicomElements.x00020010.value[0]);
                result += dwv.dicom.getTransferSyntaxName(syntax);
                result += "\n";
                checkHeader = false;
            }
            result += this.getElementAsString(dicomElement) + "\n";
        }
        return result;
    };

};

/**
 * Get a data element as a string.
 * @param {Object} dicomElement The DICOM element.
 * @param {String} prefix A string to prepend this one.
 */
dwv.dicom.DicomElementsWrapper.prototype.getElementAsString = function ( dicomElement, prefix )
{
    // default prefix
    prefix = prefix || "";

    // get element from dictionary
    var dict = dwv.dicom.dictionary;
    var dictElement = null;
    if ( typeof dict[dicomElement.tag.group] !== "undefined" &&
            typeof dict[dicomElement.tag.group][dicomElement.tag.element] !== "undefined") {
        dictElement = dict[dicomElement.tag.group][dicomElement.tag.element];
    }

    var deSize = dicomElement.value.length;
    var isOtherVR = ( dicomElement.vr[0].toUpperCase() === "O" );

    // no size for delimitations
    if ( dicomElement.tag.group === "0xFFFE" && (
            dicomElement.tag.element === "0xE00D" ||
            dicomElement.tag.element === "0xE0DD" ) ) {
        deSize = 0;
    }
    else if ( isOtherVR ) {
        deSize = 1;
    }

    var isPixSequence = (dicomElement.tag.group === '0x7FE0' &&
        dicomElement.tag.element === '0x0010' &&
        dicomElement.vl === 'u/l');

    var line = null;

    // (group,element)
    line = "(";
    line += dicomElement.tag.group.substr(2,5).toLowerCase();
    line += ",";
    line += dicomElement.tag.element.substr(2,5).toLowerCase();
    line += ") ";
    // value representation
    line += dicomElement.vr;
    // value
    if ( dicomElement.vr !== "SQ" && dicomElement.value.length === 1 && dicomElement.value[0] === "" ) {
        line += " (no value available)";
        deSize = 0;
    }
    else {
        // simple number display
        if ( dicomElement.vr === "na" ) {
            line += " ";
            line += dicomElement.value[0];
        }
        // pixel sequence
        else if ( isPixSequence ) {
            line += " (PixelSequence #=" + deSize + ")";
        }
        // 'O'ther array, limited display length
        else if ( isOtherVR ||
                dicomElement.vr === 'pi' ||
                dicomElement.vr === "UL" ||
                dicomElement.vr === "US" ||
                dicomElement.vr === "SL" ||
                dicomElement.vr === "SS" ||
                dicomElement.vr === "FL" ||
                dicomElement.vr === "FD" ||
                dicomElement.vr === "AT" ) {
            line += " ";
            var valuesStr = "";
            var valueStr = "";
            for ( var k = 0; k < dicomElement.value.length; ++k ) {
                valueStr = "";
                if ( k !== 0 ) {
                    valueStr += "\\";
                }
                if ( dicomElement.vr === "FL" ) {
                    valueStr += Number(dicomElement.value[k].toPrecision(8));
                }
                else if ( isOtherVR ) {
                    var tmp = dicomElement.value[k].toString(16);
                    if ( dicomElement.vr === "OB" ) {
                        tmp = "00".substr(0, 2 - tmp.length) + tmp;
                    }
                    else {
                        tmp = "0000".substr(0, 4 - tmp.length) + tmp;
                    }
                    valueStr += tmp;
                }
                else {
                    valueStr += dicomElement.value[k];
                }
                if ( valuesStr.length + valueStr.length <= 65 ) {
                    valuesStr += valueStr;
                }
                else {
                    valuesStr += "...";
                    break;
                }
            }
            line += valuesStr;
        }
        else if ( dicomElement.vr === 'SQ' ) {
            line += " (Sequence with";
            if ( dicomElement.vl === "u/l" ) {
                line += " undefined";
            }
            else {
                line += " explicit";
            }
            line += " length #=";
            line += dicomElement.value.length;
            line += ")";
        }
        // default
        else {
            line += " [";
            for ( var j = 0; j < dicomElement.value.length; ++j ) {
                if ( j !== 0 ) {
                    line += "\\";
                }
                if ( typeof dicomElement.value[j] === "string" ) {
                    line += dwv.dicom.cleanString(dicomElement.value[j]);
                }
                else {
                    line += dicomElement.value[j];
                }
            }
            line += "]";
        }
    }

    // align #
    var nSpaces = 55 - line.length;
    if ( nSpaces > 0 ) {
        for ( var s = 0; s < nSpaces; ++s ) {
            line += " ";
        }
    }
    line += " # ";
    if ( dicomElement.vl < 100 ) {
        line += " ";
    }
    if ( dicomElement.vl < 10 ) {
        line += " ";
    }
    line += dicomElement.vl;
    line += ", ";
    line += deSize; //dictElement[1];
    line += " ";
    if ( dictElement !== null ) {
        line += dictElement[2];
    }
    else {
        line += "Unknown Tag & Data";
    }

    var message = null;

    // continue for sequence
    if ( dicomElement.vr === 'SQ' ) {
        var item = null;
        for ( var l = 0; l < dicomElement.value.length; ++l ) {
            item = dicomElement.value[l];
            var itemKeys = Object.keys(item);
            if ( itemKeys.length === 0 ) {
                continue;
            }

            // get the item element
            var itemElement = item.xFFFEE000;
            message = "(Item with";
            if ( itemElement.vl === "u/l" ) {
                message += " undefined";
            }
            else {
                message += " explicit";
            }
            message += " length #="+(itemKeys.length - 1)+")";
            itemElement.value = [message];
            itemElement.vr = "na";

            line += "\n";
            line += this.getElementAsString(itemElement, prefix + "  ");

            for ( var m = 0; m < itemKeys.length; ++m ) {
                if ( itemKeys[m] !== "xFFFEE000" ) {
                    line += "\n";
                    line += this.getElementAsString(item[itemKeys[m]], prefix + "    ");
                }
            }

            message = "(ItemDelimitationItem";
            if ( itemElement.vl !== "u/l" ) {
                message += " for re-encoding";
            }
            message += ")";
            var itemDelimElement = {
                    "tag": { "group": "0xFFFE", "element": "0xE00D" },
                    "vr": "na",
                    "vl": "0",
                    "value": [message]
                };
            line += "\n";
            line += this.getElementAsString(itemDelimElement, prefix + "  ");

        }

        message = "(SequenceDelimitationItem";
        if ( dicomElement.vl !== "u/l" ) {
            message += " for re-encod.";
        }
        message += ")";
        var sqDelimElement = {
                "tag": { "group": "0xFFFE", "element": "0xE0DD" },
                "vr": "na",
                "vl": "0",
                "value": [message],
            };
        line += "\n";
        line += this.getElementAsString(sqDelimElement, prefix);
    }
    // pixel sequence
    else if ( isPixSequence ) {
        var pixItem = null;
        for ( var n = 0; n < dicomElement.value.length; ++n ) {
            pixItem = dicomElement.value[n];
            line += "\n";
            pixItem.vr = 'pi';
            line += this.getElementAsString(pixItem, prefix + "  ");
        }

        var pixDelimElement = {
                "tag": { "group": "0xFFFE", "element": "0xE0DD" },
                "vr": "na",
                "vl": "0",
                "value": ["(SequenceDelimitationItem)"],
            };
        line += "\n";
        line += this.getElementAsString(pixDelimElement, prefix);
    }

    return prefix + line;
};

/**
 * Get a DICOM Element value from a group and an element.
 * @param {Number} group The group.
 * @param {Number} element The element.
 * @return {Object} The DICOM element value.
 */
dwv.dicom.DicomElementsWrapper.prototype.getFromGroupElement = function (
    group, element )
{
   return this.getFromKey(
       dwv.dicom.getGroupElementKey(group, element) );
};

/**
 * Get a DICOM Element value from a tag name.
 * Uses the DICOM dictionary.
 * @param {String} name The tag name.
 * @return {Object} The DICOM element value.
 */
dwv.dicom.DicomElementsWrapper.prototype.getFromName = function ( name )
{
   var group = null;
   var element = null;
   var dict = dwv.dicom.dictionary;
   var keys0 = Object.keys(dict);
   var keys1 = null;
   var k0 = 0;
   var k1 = 0;
   // label for nested loop break
   outLabel:
   // search through dictionary
   for ( k0 = 0; k0 < keys0.length; ++k0 ) {
       group = keys0[k0];
       keys1 = Object.keys( dict[group] );
       for ( k1 = 0; k1 < keys1.length; ++k1 ) {
           element = keys1[k1];
           if ( dict[group][element][2] === name ) {
               break outLabel;
           }
       }
   }
   var dicomElement = null;
   // check that we are not at the end of the dictionary
   if ( k0 !== keys0.length && k1 !== keys1.length ) {
       dicomElement = this.getFromKey(dwv.dicom.getGroupElementKey(group, element));
   }
   return dicomElement;
};
