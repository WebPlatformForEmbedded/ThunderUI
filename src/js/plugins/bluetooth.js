/** The bluetooth plugin provides details on the available bluetooth devices, scans for new devices and allows the user to connect the device through UI
 */
class BluetoothControl extends Plugin {

    constructor(pluginData) {
        super(pluginData);

        this.discoveredDevices = [];
        this.pairedDevices = [];
        this.connectedDevices = [];
        this.scanning = false;
        this.displayName = 'BluetoothControl';
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
        this.scanningStatus             = document.getElementById('BT_Scanning');
        this.statusMessages             = document.getElementById('statusMessages');

        // ---- Connected Devices -----
        this.connectedDeviceList       = document.getElementById('BT_ConnectedDevices');

        // ---- Paired Devices -----
        this.pairedDeviceList           = document.getElementById('BT_PairedDevices');

        // ---- Discovered Devices ----
        this.discoveredDeviceList       = document.getElementById('BT_DiscoveredDevices');

        setTimeout(this.update.bind(this), 1000);
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

            if(resp.devices !== undefined) {
                this.discoveredDevices = resp.devices;
                this.renderDiscoveredDevices();
                this.renderPairedDevices();
                this.renderConnectedDevices();
            }

            if (typeof resp.scanning === 'boolean')
                this.scanning = resp.scanning;

            this.renderStatus();
        });
    }


    /* ----------------------------- RENDERING ------------------------------*/

    renderStatus () {
        this.scanningStatus.innerHTML = this.scanning === true ? 'ON' : 'OFF';
        if(!this.scanning)
            clearInterval(this.Timer);
    }

    renderDiscoveredDevices () {
        this.discoveredDeviceList.innerHTML = '';
        for (var i=0; i<this.discoveredDevices.length; i++) {
            var newChild = this.discoveredDeviceList.appendChild(document.createElement("option"));
            if (this.discoveredDevices[i].name === "")
                newChild.innerHTML = `${this.discoveredDevices[i].address}`;
            else
                newChild.innerHTML = `${this.discoveredDevices[i].name}`;

        }
    }

    renderPairedDevices () {
        this.pairedDeviceList.innerHTML = '';
        for (var i=0; i<this.discoveredDevices.length; i++) {
            var newChild = this.pairedDeviceList.appendChild(document.createElement("option"));
            if(this.discoveredDevices[i].paired) {
                this.pairedDevices[i] = this.discoveredDevices[i];
                if (this.discoveredDevices[i].name === "")
                    newChild.innerHTML = `${this.discoveredDevices[i].address}`;
                else
                    newChild.innerHTML = `${this.discoveredDevices[i].name}`;
            }
        }
    }

    renderConnectedDevices () {
        this.connectedDeviceList.innerHTML = '';
        for (var i=0; i<this.discoveredDevices.length; i++) {
            var newChild = this.connectedDeviceList.appendChild(document.createElement("option"));
            if(this.discoveredDevices[i].connected) {
                this.connectedDevices[i] = this.discoveredDevices[i];
                if (this.discoveredDevices[i].name === "")
                    newChild.innerHTML = `${this.discoveredDevices[i].address}`;
                else
                    newChild.innerHTML = `${this.discoveredDevices[i].name}`;
            }
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

            setTimeout(this.update.bind(this), 100);
            // update every 3s
            this.Timer = setInterval(this.update.bind(this), 3000);

        });
    }

    pairDevice() {

        var idx = this.discoveredDeviceList.selectedIndex;
        if (this.discoveredDevices[idx].name === "")
            this.status(`Pairing to ${this.discoveredDevices[idx].address}`);
        else
            this.status(`Pairing to ${this.discoveredDevices[idx].name}`);

        api.putPlugin(this.callsign, 'Pair', '{"address" : "' + this.discoveredDevices[idx].address + '"}', (err,resp) =>{

        if (err !== null) {
                console.error(err);
                return;
            }

            setTimeout(this.update.bind(this), 1000);
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

            setTimeout(this.update.bind(this), 1000);
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

            setTimeout(this.update.bind(this), 1000);
            });
    }
}

window.pluginClasses = window.pluginClasses || {};
window.pluginClasses.BluetoothControl = BluetoothControl;
