/** The bluetooth plugin provides details on the available bluetooth devices, scans for new devices and allows the user to connect the device through UI
 */
class Bluetooth extends Plugin {

    constructor(pluginData) {
        super(pluginData);

        this.discoveredDevices = [];
        this.pairedDevices = [];
        this.connectedDevices = [];
        this.scanning = false;
        this.displayName = 'Bluetooth';
    }

    render()        {
        var mainDiv = document.getElementById('main');

        mainDiv.innerHTML = `<div class="title grid__col grid__col--8-of-8">
            Status
        </div>

        <div class="label grid__col grid__col--2-of-8">
            Connected Devices
        </div>
        <div class="text grid__col grid__col--6-of-8">
            <select id="BT_ConnectedDevices"></select>
        </div>

        <div class="label grid__col grid__col--2-of-8">
            Scanning
        </div>
        <div id="BT_Scanning" class="text grid__col grid__col--6-of-8">
            OFF
        </div>

        <div class="label grid__col grid__col--2-of-8">
            Paired devices
        </div>
        <div class="text grid__col grid__col--6-of-8">
            <select id="BT_PairedDevices"></select>
        </div>

        <div class="label grid__col grid__col--2-of-8"></div>
        <div class="text grid__col grid__col--6-of-8">
            <button type="button" id="BT_Connect">Connect</button>
            <button type="button" id="BT_Disconnect">Disconnect</button>
        </div>

        <div class="title grid__col grid__col--8-of-8">
            Discovery
        </div>


        <div class="label grid__col grid__col--2-of-8">
            Discovered Devices
        </div>
        <div class="text grid__col grid__col--6-of-8">
            <select id="BT_DiscoveredDevices"></select>
        </div>
        <div class="label grid__col grid__col--2-of-8">
        </div>
        <div class="text grid__col grid__col--6-of-8">
            <button type="button" id="BT_ScanForDevices">Scan</button>
            <button type="button" id="BT_Pair">Pair</button>
        </div>

        <br>

        <div id="statusMessages" class="text grid__col grid__col--8-of-8"></div>
        `;

        // bind elements

        // ---- button ----
        this.scanButton                 = document.getElementById('BT_ScanForDevices');
        this.pairButton                 = document.getElementById('BT_Pair');
        this.connectButton              = document.getElementById('BT_Connect');
        this.disconnectButton           = document.getElementById('BT_Disconnect');

        // Bind buttons
        this.scanButton.onclick         = this.scanForDevices.bind(this);
        this.pairButton.onclick         = this.pairDevice.bind(this);
        this.disconnectButton.onclick   = this.disconnect.bind(this);
        this.connectButton.onclick      = this.connect.bind(this);

        // ---- Status -----
        this.connectedStatus            = document.getElementById('BT_Connected');
        this.scanningStatus             = document.getElementById('BT_Scanning');
        this.statusMessages             = document.getElementById('statusMessages');

        // ---- Connected Devices -----
        this.connectedDeviceList       = document.getElementById('BT_ConnectedDevices');

        // ---- Paired Devices -----
        this.pairedDeviceList           = document.getElementById('BT_PairedDevices');

        // ---- Discovered Devices ----
        this.discoveredDeviceList       = document.getElementById('BT_DiscoveredDevices');

        this.checkDeviceScanning();
        this.getPairedDevices();
        setTimeout(this.update.bind(this), 2000);
    }

    /* ----------------------------- DATA ------------------------------*/

    update() {
        api.getPluginData(this.callsign, (err, resp) => {
            if (err !== null) {
                console.error(err);
                return;
            }

            // bail out if the plugin returns nothing
            if (resp === undefined)
                return;

            this.connectedDevices = resp.deviceList;

            if (typeof resp.scanning === 'boolean')
                this.scanning = resp.scanning;

            this.renderStatus();
        });
    }

    getPairedDevices() {
        api.getPluginData(this.callsign + '/PairedDevices', (err, resp) => {
            if (err !== null) {
                console.error(err);
                return;
            }

            // bail out if the plugin returns nothing
            if (resp === undefined || resp.deviceList.length < 0)
                return;

            this.pairedDevices = resp.deviceList;
            this.renderPairedDevices();
        });
    }

    getDiscoveredDevices() {
        if (this.scanning === true) {
            api.getPluginData(this.callsign + '/DiscoveredDevices', (err, resp) => {
                    if (err !== null) {
                    console.error(err);
                    return;
                }

                // bail out if the plugin returns nothing
                if (resp === undefined || resp.deviceList.length < 0)
                    return;

                this.discoveredDevices = resp.deviceList;
                this.renderDiscoveredDevices();
            });
        }
    }

    checkDeviceScanning() {
        api.getPluginData(this.callsign, (err, resp) => {
            if (resp.scanning) {
                this.stopScan();
            }
        });
    }

    /* ----------------------------- RENDERING ------------------------------*/

    renderStatus () {
        this.renderConnectedDevices();
        this.scanningStatus.innerHTML = this.scanning === true ? 'ON' : 'OFF';
    }

    renderPairedDevices () {
        this.pairedDeviceList.innerHTML = '';
        for (var i=0; i<this.pairedDevices.length; i++) {
            var newChild = this.pairedDeviceList.appendChild(document.createElement("option"));
            if (this.pairedDevices[i].name === "")
                newChild.innerHTML = `${this.pairedDevices[i].address}`;
            else
                newChild.innerHTML = `${this.pairedDevices[i].name}`;
        }
    }

    renderDiscoveredDevices () {
        this.discoveredDeviceList.innerHTML = '';
        for (var i=0; i<this.discoveredDevices.length; i++) {
            var newChild = this.discoveredDeviceList.appendChild(document.createElement("option"));
            if (this.discoveredDevices[i].name === "")
                newChild.innerHTML = `${this.discoveredDevices[i].address}`;
            else
                newChild.innerHTML = `${this.discoveredDevices[i].name}`;

            newChild.value = JSON.stringify(this.discoveredDevices[i]);
        }
    }

    renderConnectedDevices () {
        this.connectedDeviceList.innerHTML = '';
        for (var i=0; i<this.connectedDevices.length; i++) {
            var newChild = this.connectedDeviceList.appendChild(document.createElement("option"));
            if (this.connectedDevices[i].name === "")
                newChild.innerHTML = `${this.connectedDevices[i].address}`;
            else
                newChild.innerHTML = `${this.connectedDevices[i].name}`;
        }
    }

    status(message) {
        window.clearTimeout(this.statusMessageTimer);
        this.statusMessages.innerHTML = message;

        // clear after 5s
        this.statusMessageTimer = setTimeout(this.status, 5000, '');
    }

    /* ----------------------------- BUTTONS ------------------------------*/

    scanForDevices() {
        this.status(`Start scanning`);
        api.putPlugin(this.callsign, 'Scan', null, (err, resp) => {
            if (err !== null) {
                console.error(err);
                return;
            }

            // update after 2s
            setTimeout(this.update.bind(this), 2000);

            // update discovered device list in every 4s
            this.Timer = setInterval(this.getDiscoveredDevices.bind(this), 4000);

            this.status(`Scanning...`);
            // stop scan after 15s
            setTimeout(this.stopScan.bind(this), 15000);

        });
    }

    stopScan() {
        this.status(`Stopping Scan`);
        api.putPlugin(this.callsign, 'StopScan', null, (err, resp) => {
            if (err !== null) {
                console.error(err);
                return;
            }

            clearInterval(this.Timer);
            setTimeout(this.update.bind(this), 4000);
            this.status(`Scan stopped`);
        });
    }

    pairDevice() {
        var val = JSON.parse(document.getElementById('BT_DiscoveredDevices').value);
        if (val.name === "")
            this.status(`Pairing with ${val.address}`);
        else
            this.status(`Pairing with ${val.name}`);

        api.putPlugin(this.callsign, 'Pair', '{"address" : "' + val.address + '"}', (err, resp) => {
            if (err !== null) {
                console.error(err);
                return;
            }

            // update Paired device list after 3s
            setTimeout(this.getPairedDevices.bind(this), 3000);
            setTimeout(this.update.bind(this), 5000);
        });
    }

    connect() {
        var idx = this.pairedDeviceList.selectedIndex;
        if (this.pairedDevices[idx].name === "")
            this.status(`Connecting to ${this.pairedDevices[idx].address}`);
        else
            this.status(`Connecting to ${this.pairedDevices[idx].name}`);

        api.putPlugin(this.callsign, 'Connect', '{"address" : "' + this.pairedDevices[idx].address + '"}', (err,resp) =>{
            if (err !== null) {
                console.error(err);
                return;
            }

            // update after 3s
            setTimeout(this.update.bind(this), 3000);
        });
    }

    disconnect() {
        var idx = this.connectedDeviceList.selectedIndex;
        if (this.connectedDevices[idx].name === "")
            this.status(`Disconnecting to ${this.connectedDevices[idx].address}`);
        else
            this.status(`Disconnecting to ${this.connectedDevices[idx].name}`);

        api.putPlugin(this.callsign, 'Disconnect', '{"address" : "' + this.connectedDevices[idx].address + '"}', (err,resp) =>{
            if (err !== null) {
                console.error(err);
                return;
            }

            // update after 3s
            setTimeout(this.update.bind(this), 3000);
        });
    }
}

window.pluginClasses = window.pluginClasses || {};
window.pluginClasses.Bluetooth = Bluetooth;
