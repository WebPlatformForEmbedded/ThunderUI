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

    createSnapshot() {
        var CurrentTime = new Date().getTime();
        const _rest = {
            method  : 'GET',
            path    : `${this.callsign}/Capture?${CurrentTime}`,
            type    : 'arraybuffer'
        };
        const _rpc = {
            plugin : this.callsign,
            method : 'capture'
        }

        return this.api.req(_rest).then( resp => {
            if (resp === null || resp === undefined)
                return;

            var image = resp.image ? resp.image : resp;

            var snapshotImage = document.getElementById('snapshotOutput');
            snapshotImage.src = '';
            snapshotImage.setAttribute('src', 'data:image/png;base64,' + btoa(String.fromCharCode.apply(null, new Uint8Array(image))));

            this.statusMessage("Snapshot Device:" + resp.device);
        });
    }

    statusMessage(message) {
        this.statusMessages.innerHTML = message;
    }
}
export default Snapshot;
