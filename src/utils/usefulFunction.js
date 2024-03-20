export const isJSON = function (str){
    if (/^[\],:{}\s]*$/.test(str.replace(/\\["\\\/bfnrtu]/g, '@').
replace(/"[^"\\\n\r]*"|true|false|null|-?\d (?:\.\d*)?(?:[eE][ \-]?\d )?/g, ']').
replace(/(?:^|:|,)(?:\s*\[) /g, ''))) {
    return true;
}else{
    return false;
}

}

export const getOffsetNews=(el,getter=[0,0])=>{
    if(el.parentElement){
        getter[0]+=el.offsetLeft;
        getter[1]+=el.offsetTop;
        return getOffsetNews(el.parentElement,getter)

    }else{
        return getter
    }
}