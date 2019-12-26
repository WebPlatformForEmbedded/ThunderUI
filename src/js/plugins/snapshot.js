/** The snapshot plugin captures snapshots from the device
 */

import Plugin from '../core/plugin.js';

class Snapshot extends Plugin {

    constructor(pluginData, api) {
        super(pluginData, api);
    }

    render()        {
        var mainDiv = document.getElementById('main');

        mainDiv.innerHTML = `<div class="title grid__col grid__col--8-of-8">
            Create
        </div>

        <div class="label grid__col grid__col--2-of-8">
            Snapshot
        </div>
        <div class="text grid__col grid__col--6-of-8">
            <button id="snapshotButton" type="button">CREATE</button>
        </div>

        <div id="statusMessages" class="text grid__col grid__col--8-of-8"></div>

        <div id="myOutput">
            <img id="snapshotOutput" />
        </div>`;

      var snapshotButton = document.getElementById('snapshotButton');
      this.statusMessages = document.getElementById('statusMessages');
      snapshotButton.onclick = this.createSnapshot.bind(this);
    }

    getSnapshotLocator() {
        return this.api.getURLStart('http') + 'Snapshot/Capture?' + new Date().getTime();
    }

    createSnapshot() {
        var CurrentTime = new Date().getTime();
        const _rest = {
            method  : 'GET',
            path    : `${this.callsign}/Capture?${CurrentTime}`
        };


        return this.api.req(_rest).then( resp => {
            this.statusMessage('Got Snapshot Image');
            if (resp === null)
                return;

            this.statusMessage('Hai Test');
            var snapshotImage = document.getElementById('snapshotOutput');
            snapshotImage.src = '';
            snapshotImage.src = "data:image/png;base64," + this.base64encode(resp.image);
            this.statusMessage(_rest.path);
        });
    }

    base64encode(binary) {
        return btoa(unescape(encodeURIComponent(binary)));
    }

    statusMessage(message) {
        this.statusMessages.innerHTML = message;
    }
}
export default Snapshot;
