var pi = (function () {

    function testMethod() {
        alert("Test");
    }

    function initializeInterruptionData() {
        //empty promise approach
        if (!shallWeUpdate(05,false)) return emptyPromise();

        var updatePromise = updateAllInterruptions();

        updatePromise.done(function (data) {
            localStorage["pi.interruptions.all"] = JSON.stringify(data);
            localStorage["pi.interruptions.current"] = findElements(localStorage["pi.interruptions.all"],"IsInterrupted","true");
            localStorage["pi.interruptions.local.lastupdated"] = new Date().toString();
            console.log("Finished updating all interruptions");
        });

        updatePromise.fail(function (data) {
            console.log("Failed to load all interruptions");
        });
    }

    function promiseInitializeCurrentInterruption() {
          //client has to manage this return 
          //if (!shallWeUpdate(05,true)) return;

          var updatePromise = updateCurrentInterruptions();

          updatePromise.done(function (data) {
                if (data === undefined || data === '') return;
                localStorage["pi.interruptions.current"] = JSON.stringify(data);
                localStorage["pi.interruptions.local.current.lastupdated"] = new Date().toString();
                console.log("Finished updating current interruptions");
          });

          updatePromise.fail(function (data) {
            console.log("Failed to load current interruptions");
          });

          return updatePromise;

    }

      //Provides the last update time from Western Power
    function promiseLastUpdatedTime() {

       if (!shallWeUpdate(05,false)) return emptyPromise();
       
        var promise = getLastInterruptionDataUpdateTime();
        promise.done(function (data) {
            if (data === undefined || data === '') return;
            localStorage["pi.interruptions.lastupdated"] = data;
        });
        return promise;
    }


    function shallWeUpdate(minutes,isCurrent) {
        
        var lastUpdated = null;
        if (isCurrent) {
            lastUpdated = localStorage["pi.interruptions.local.current.lastupdated"];
        } else {
            lastUpdated = localStorage["pi.interruptions.local.lastupdated"];
        }
       
        if (lastUpdated === undefined || lastUpdated === '') return true;

        var nextUpdateTime = new Date(lastUpdated);
        nextUpdateTime.setMinutes(nextUpdateTime.getMinutes() + minutes);

        if (new Date() > nextUpdateTime) return true;
        console.log("Not triggering the update because a recent update has been triggered at  : " + lastUpdated);
        return false;
    }

    function getInterruptionSuburb(suburb) {
        var allJson = JSON.parse(localStorage["pi.interruptions.all"]);
        return findElement(allJson, 'Name', suburb.toUpperCase());
    }

    function getInterruptionPostcode(postcode) {
        
        var allJson = JSON.parse(localStorage["pi.interruptions.all"]);
        return findElements(allJson, 'PostCode', postcode);
    }

    function getLastUpdateTimeStamp() {
        return new Date(localStorage["pi.interruptions.lastupdated"]);
    }

    function promiseInterruptionDataFromWp(location) {
          return getRealTimeInterruptions(location);
    }

    function getCurrentInterruptions() {
        var data = localStorage["pi.interruptions.current"];
        if (data === undefined || data === '') return;
        return JSON.parse(data);
    }

  
    function findElement(arr, propName, propValue) {
        for (var i = 0; i < arr.length; i++)
            if (arr[i][propName] === propValue)
                return arr[i];
        // will return undefined if not found; you could return a default instead
    }

    function findElements(arr, propName, propValue) {
        var list = new Array();
        for (var i = 0; i < arr.length; i++) {
            if (arr[i][propName] === propValue) {
                list.push(arr[i]);
            }
        }
        return list;
    }

    function findExcludingElements(arr, propName, propValue) {
        var list = new Array();
        for (var i = 0; i < arr.length; i++) {
            if (arr[i][propName] !== propValue) {
                list.push(arr[i]);
            }
        }
        return list;
    }



    function updateAllInterruptions() {
        console.log("calling power interruption API @ TNU : All Items");
        var url = 'http://tnu.apphb.com/api/powerinterruption/all';

        return $.ajax({
            url: url,
            type: 'GET',
            dataType: 'jsonp'
        });
    }
    
    function getRealTimeInterruptions(location) {
        console.log("calling power interruption API @ TNU : " + location);
        var url = 'http://tnu.apphb.com/api/powerinterruption/realtime/' + location;

        return $.ajax({
            url: url,
            type: 'GET',
            dataType: 'jsonp'
        });
    }


    function updateCurrentInterruptions() {
        console.log("calling power interruption API @ TNU : Current Items");
        var url = 'http://tnu.apphb.com/api/powerinterruption/servicedown';
        return $.ajax({
            url: url,
            type: 'GET',
            dataType: 'jsonp'
           
        });
       
    }

    function getLastInterruptionDataUpdateTime() {
        console.log("calling power interruption API @ TNU : Last Update Time");
        var url = 'http://tnu.apphb.com/api/powerinterruption/LastUpdatedTimeStamp';
        return $.ajax({
            url: url,
            type: 'GET',
            dataType: 'jsonp',
        });
   
    }

     function sleep(delay) {
        var start = new Date().getTime();
        while (new Date().getTime() < start + delay);
     }

     function emptyPromise() {
            var d = $.Deferred();
            d.resolve();
            return d.promise();
     }

    return {
        initializeInterruptionData: initializeInterruptionData,
       
        getInterruptionSuburb: getInterruptionSuburb,
        getInterruptionPostcode: getInterruptionPostcode,
        getCurrentInterruptions: getCurrentInterruptions,
        getLastUpdateTimeStamp: getLastUpdateTimeStamp,

        promiseInitializeCurrentInterruption: promiseInitializeCurrentInterruption,
        promiseInterruptionDataFromWp: promiseInterruptionDataFromWp,
        promiseLastUpdatedTime: promiseLastUpdatedTime,
    }
} ());