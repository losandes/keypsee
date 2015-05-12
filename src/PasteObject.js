/*globals Hilary*/
/*
//
*/
Hilary.scope('keypsee').register({
    name: 'PasteObject',
    dependencies: ['FileReader'],
    factory: function (FileReader) {
        "use strict";
        
        var PasteObject;
        
        PasteObject = function (pasteobj) {
            var self = this;
            
            pasteobj = pasteobj || {};
            
            self.kind = pasteobj.kind;
            self.type = pasteobj.type;
            self.file = pasteobj.file;
            self.data = pasteobj.data;
            self.dataUrl = pasteobj.dataUrl;
            
            self.toDataUrl = function () {
                if (!FileReader) {
                    return;
                }

                var reader = new FileReader();

                reader.onload = function (event) {
                    self.dataUrl = event.target.result;
                };

                return reader.readAsDataURL(self.file);
            };
        };
        
        return PasteObject;
    }
});
