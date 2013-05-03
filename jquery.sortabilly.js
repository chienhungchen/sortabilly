/* 
    Title:          jquery.sortabilly.js
    Version:        0.0.1
    Author:         Chien-Hung Chen (github.com/chienhungchen)
    Dependencies:   Draggabilly.js, Droppabilly.js


    Known bugs/To-do list:
        - Exposure of placeholder CSS so user can apply their own CSS class
        - Fix issue with Sortabilly hijacking id's 
            (ex: placeholderId over takes the id so you can't use ids for styling the placeholder)
        - Fix issue with css from using child selectors (ex: #id > li vs. li.class)
*/


(function($){
    "use strict";
    var ns = 'sortabilly-',
        d_index = ns + 'index',
        d_inlineStyle = ns + 'inlineStyle',
        d_zindex = ns + 'z-index';

    var methods = {
        init: function(options) {
            var $mainEl = this,
                dragsters = [],
                dragstersPos = [],
                tmpDragstersClone = [],
                toDuration = options && options.animationDuration ? options.animationDuration : 500,
                sensitivity = options && options.overlapSensitivity ? 1 - options.overlapSensitivity : 0.5,
                placeholderId = options && options.placeholderId ? options.placeholderId : ns + 'placeholder',
                draggabillyOptions = {};

            if(options) {
                if(options.containment) {
                    draggabillyOptions = $.extend(draggabillyOptions, {containment: options.containment});
                }
                if(options.handle) {
                    draggabillyOptions = $.extend(draggabillyOptions, {handle: options.handle});
                }
            }

            function onDragStart(instance, event, pointer) {
                var $drag = $(instance.element),
                    startPosition = dragstersPos[$drag.data(d_index)],
                    $ph = $('#' + placeholderId);
                //backup the original dragsters for use in onDragEnd
                tmpDragstersClone = dragsters.slice(0);

                //Create the placeholder
                if($ph.length === 0) {
                    $drag.after(
                        $drag.clone().attr('id', placeholderId)
                            .attr('style', $drag.data(d_inlineStyle))
                            .css({ opacity: 0.5 }).data(d_index, $drag.data(d_index))
                    );

                    //Now set the css for the drag instance
                    $drag.css({
                        transition: 'none',
                        '-webkit-transition': 'none',
                        'z-index': 2e10,
                        'position': 'absolute',
                        top: startPosition.top + 'px',
                        left: startPosition.left + 'px'
                    });
                }
            }

            function onDragMove(instance, event, pointer) {
                var $drag = $(instance.element);
                var $ph = $('#' + placeholderId);
                for(var i = 0; i < dragsters.length; i++) {

                    var $dragster = $(dragsters[i].element);

                    //If they overlap and the overlap is over 50% of one of the two elements in question
                    if( i !== $drag.data(d_index)
                        && methods.overlap(instance.element, $dragster[0])
                        && methods.overlapPercentage(instance.element, $dragster[0]) > sensitivity) {

                        var fromIndex = $drag.data(d_index),
                            toIndex = $dragster.data(d_index);

                        //Append the placeholder to be before or after the element overlapped
                        if(fromIndex < toIndex) { //moving down
                            $dragster.after($ph);
                        }
                        else if(fromIndex > toIndex) { //moving up
                            $dragster.before($ph);
                        }

                        $drag.data(d_index, toIndex);
                        if(fromIndex < toIndex) {
                            for(var j = fromIndex; j < toIndex; j++) {
                                $(dragsters[j + 1].element).data(d_index, j);
                            }
                        }
                        else if(fromIndex > toIndex) {
                            for(var j = fromIndex; j > toIndex; j--) {
                                $(dragsters[j - 1].element).data(d_index, j);
                            }
                        }

                        console.log('from: ' + fromIndex + ' to: ' + toIndex);
                        //Now for some switch-a-roo
                        dragsters.splice(toIndex, 0, dragsters.splice(fromIndex, 1)[0]);
                    }
                }
            }

            function onDragEnd(instance, event, pointer) {
                var $drag = $(instance.element),
                    $ph = $('#' + placeholderId),
                    fromIndex = $ph.data(d_index),
                    toIndex = $drag.data(d_index),
                    $targetDragster = $(tmpDragstersClone[toIndex].element),
                    startPosition = dragstersPos[toIndex];

                if(fromIndex > toIndex) {
                    $targetDragster.before($drag);
                }
                else if(fromIndex < toIndex) {
                    $targetDragster.after($drag);
                }

                $drag.css({
                    transform: 'translate3d(' + (-instance.position.x + startPosition.left) + 'px, ' + (-instance.position.y + startPosition.top) + 'px, 0)',
                    '-webkit-transform': 'translate3d(' + (-instance.position.x + startPosition.left) + 'px, ' + (-instance.position.y + startPosition.top) + 'px, 0)',
                    transition: 'all ' + toDuration/1000 + 's ease-out',
                    '-webkit-transition': 'all ' + toDuration/1000 + 's ease-out'
                });
                
                setTimeout(function(){
                    $drag.css({
                        position: 'relative',
                        'z-index': $drag.data(d_zindex),
                        transform: 'translate3d(' + -instance.position.x + 'px, ' + -instance.position.y + 'px, 0)',
                        '-webkit-transform': 'translate3d(' + -instance.position.x + 'px, ' + -instance.position.y + 'px, 0)',
                        transition: 'none',
                        '-webkit-transition': 'none'
                    });
                    $ph.remove();
                }, toDuration);
            }

            //Loop through each element and make then a draggabilly
            this.find('li').each(function(index){
                var $t = $(this),
                    draggabilly = new Draggabilly(this, draggabillyOptions);

                draggabilly.on('dragMove', onDragMove);
                draggabilly.on('dragStart', onDragStart);
                draggabilly.on('dragEnd', onDragEnd);

                dragsters.push(draggabilly);
                dragstersPos.push($t.position());

                //Set some data for each element
                $t.data(d_index, index);
                $t.data(d_zindex, methods.getStyle(this, 'z-index'));
                $t.data(d_inlineStyle, $t.attr('style'));
            });
            var isUp = false;
            if(options && options.connect) {
                $(options.connect.elements).each(function(){
                    $(this).data(d_inlineStyle, $(this).attr('style'));
                });

                this.droppabilly({
                    dragsters: options.connect.elements,
                    over: function(drop, drag) {
                        if(options.connect.over) {
                            options.connect.over(drop, drag);
                        }

                        for(var i = 0; i < dragsters.length; i++) {
                            var $dragster = $(dragsters[i].element);

                            //If they overlap and the overlap is over 50% of one of the two elements in question
                            if( methods.overlap(drag[0], $dragster[0])
                                && methods.overlapPercentage(drag[0], $dragster[0]) > sensitivity) {
                                var $ph = $('#' + placeholderId),
                                    fromIndex = $ph.data(d_index),
                                    toIndex = $dragster.data(d_index);

                                if($ph.length === 0) { //placeholder hasn't been appended yet
                                    $ph = drag.clone().attr('id', placeholderId).attr('style', drag.data(d_inlineStyle)).data(d_index, i);
                                    $dragster.before($ph);
                                }
                                else {
                                    $ph.data(d_index, toIndex);
                                    //Append the placeholder to be before or after the element overlapped
                                    if(fromIndex < toIndex) { //moving down
                                        $dragster.after($ph);
                                        for(var j = fromIndex; j < toIndex; j++) {
                                            $(dragsters[j + 1].element).data(d_index, j);
                                        }
                                    }
                                    else if(fromIndex > toIndex) { //moving up
                                        $dragster.before($ph);
                                        for(var j = fromIndex; j > toIndex; j--) {
                                            $(dragsters[j - 1].element).data(d_index, j);
                                        }
                                    }
                                    else {
                                        if(isUp) {
                                            $dragster.before($ph);
                                        }
                                        else {
                                            $dragster.after($ph);
                                        }
                                        isUp = !isUp;
                                    }

                                    console.log('from: ' + fromIndex + ' to: ' + toIndex);
                                    dragsters.splice(toIndex, 0, dragsters.splice(fromIndex, 1)[0]);
                                }
                            }
                        }
                    },
                    out: function(drop, drag) {
                        if(options.connect.out) {
                            options.connect.out(drop, drag);
                        }
                        $('#' + placeholderId).remove();
                        isUp = false;
                    },
                    drop: function(drop, drag) {
                        if(options.connect.drop) {
                            options.connect.drop(drop, drag);
                        }

                        var $ph = $('#' + placeholderId);
                        $ph.attr('id', '').data(d_inlineStyle, $ph.attr('style'));

                        var d = new Draggabilly($ph[0], draggabillyOptions);
                        d.on('dragMove', onDragMove);
                        d.on('dragStart', onDragStart);
                        d.on('dragEnd', onDragEnd);

                        //splice on the dragster
                        if(!isUp) {
                            dragsters.splice($ph.data(d_index), 0, d);
                        }
                        else {
                            dragsters.splice($ph.data(d_index) + 1, 0, d);
                        }
                        //Recalculate the index for each element
                        for(var i = 0; i < dragsters.length; i++) {
                           $(dragsters[i].element).data(d_index, i);
                        }

                        //push the bottom most position on
                        dragstersPos.push($ph.parent().children().last().position());
                    }
                });
            }
        },
        getStyle: function(el, styleProp) {
            var y;
            if (window.getComputedStyle) {
                y = document.defaultView.getComputedStyle(el,null).getPropertyValue(styleProp); 
            }
            else if (el.currentStyle) {
                y = el.currentStyle[styleProp];
            }                     
            return y;
        },
        calcDimension: function(p1, p2) {
            var r1, r2;
            r1 = p1[0] < p2[0] ? p1 : p2;
            r2 = p1[0] < p2[0] ? p2 : p1;
            return r1[1] > r2[0] ? r1[1] - r2[0] : r1[0] - r2[1];
        },
        overlapPercentage: function(a, b) {
            var p1 = methods.getPositions(a),
                p2 = methods.getPositions(b),
                w = methods.calcDimension(p1[0], p2[0]),
                h = methods.calcDimension(p1[1], p2[1]),
                overlapArea = w * h,
                aArea = (p1[0][1] - p1[0][0]) * (p1[1][1] - p1[1][0]),
                bArea = (p2[0][1] - p2[0][0]) * (p2[1][1] - p2[1][0]),
                aRatio = overlapArea/aArea,
                bRatio = overlapArea/bArea;
            return aRatio > bRatio ? aRatio : bRatio;
        },
        overlap: function(a, b) {
            var p1 = methods.getPositions(a),
            p2 = methods.getPositions(b);
            return methods.comparePositions(p1[0], p2[0]) && methods.comparePositions(p1[1], p2[1]);
        },
        getPositions: function(el) {
            var pos = $(el).offset(),
            width = $(el).outerWidth(),
            height = $(el).outerHeight();
            return [ [ pos.left, pos.left + width ], [ pos.top, pos.top + height ] ];
        },
        comparePositions: function(p1, p2) {
            var r1, r2;
            r1 = p1[0] < p2[0] ? p1 : p2;
            r2 = p1[0] < p2[0] ? p2 : p1;
            return r1[1] > r2[0] || r1[0] === r2[0];
        },
        getDefined: function(f) {
            return f === undefined || f === null ? function() {} : f;
        },
        insertPlaceholder: function(pos) {
            console.log('insertPlaceholder');
            console.log(pos);

        },
        removePlaceholder: function(pos, type) {
            //code to remove the placeholder inserted in insertPlaceholder
            console.log('removePlaceholder');
        },
        insertElement: function(pos, type) {
            // code to insert element into sortabilly based on position
            // type by default is 'location', can also be 'index'
            console.log('insertElement');
        }
    };

    $.fn.sortabilly = function(method) {
        if(methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        }
        else if(typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        }
        else {
            $.error('Method ' +  method + ' does not exist on jQuery.sortabilly');
        }
    };

})(jQuery);