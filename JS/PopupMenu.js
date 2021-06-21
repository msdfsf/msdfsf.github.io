
// function does not check anything, if it is necessary do it by yourself
function buildPopupMenu(options, icons, functions, itemSize, x, y) {

    var menu = document.createElement('ul');

    menu.id                     = 'popupMenu';
    menu.event                  = null;
    menu.style.top              = y + 'px';
    menu.style.left             = x + 'px';
    menu.style.width            = 'auto';
    menu.style.backgroundColor  = 'rgba(255, 255, 255, 0.8)';
    menu.style.borderColor      = 'grey';
    menu.style.borderWidth      = '2px';
    menu.style.borderRadius     = '5px';
    menu.style.position         = 'absolute';
    menu.style.opacity          = 0;
    menu.style.backdropFilter   = 'blur(1px)';
    menu.style.fontSize         = (Number(itemSize) - 2) + 'px';
    menu.style.listStyleType    = 'none';
    menu.style.padding          = '2px';
    menu.style.fontFamily       = 'Arial';
    menu.style.cursor           = 'default';

    for (let i = 0; i < options.length; i++) {

        // helper
        var helper = document.createElement('div');

        helper.style.height             = '100%';
        helper.style.width              = '10px';
        helper.style.backgroundColor    = 'black';
        helper.style.display            = 'inline-block';

        // icon
        var ico = document.createElement('img');

        ico.src                 = icons[i];
        ico.style.height        = '80%';
        ico.style.float         = 'right'
        ico.style.marginLeft    = '2em';
        ico.style.display       = 'inline-block';
        ico.style.transform     = 'translate(0, 10%)';

        // item
        var item = document.createElement("li");

        item.style.height   = itemSize + 'px';
        item.style.padding  = '0px 2px';
        item.style.width    = 'auto';
        item.style.display  = 'block';
        item.style.cursor   = 'normal';
        item.id             = 'option' + i;

        item.addEventListener("mouseover", function() {
            
            this.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
            
            if (i === 0) {
                this.style.borderRadius = '5px 5px 0 0';
            } else if (i === options.length - 1) {
                this.style.borderRadius = '0 0 5px 5px';
            }

        });

        item.addEventListener("mouseout", function() {
            this.style.backgroundColor = 'transparent';
        });

        item.addEventListener('click', function() {
            functions[i](menu.event);
        });

        // text
        var text = document.createTextNode(options[i]);

        // connecting it together
        item.appendChild(text);
        item.appendChild(ico);
        menu.appendChild(item);

    }

    //document.body.appendChild(menu).focus();

    menu.style.transition = '0.8s ease-out';
    menu.style.opacity = 1;

    function redraw(x, y, event = null) {

        menu.style.display = 'none';

        menu.style.top = y + 'px';
        menu.style.left = x + 'px';

        menu.style.display = 'block';
        
        menu.event = event;
    
    }

    menu.redraw = redraw;

	function hide() {
		
		menu.style.display = 'none';
	
	}
	
	menu.hide = hide;
	
    document.body.addEventListener('click', function() {

		menu.style.display = 'none';

    });

    return menu;
}