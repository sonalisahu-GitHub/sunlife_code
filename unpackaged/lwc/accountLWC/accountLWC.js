import { LightningElement, wire, track } from 'lwc';
import getAccounts from '@salesforce/apex/AccountController.getAccounts';
import { updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
 
// columns
const columns = [
    {
        label: 'Name',
        fieldName: 'accountLink',
        type: 'url',
        editable: false,
        sortable: "true",
        typeAttributes: { label: { fieldName: 'Name' },
        target: '_blank'}, 
        wrapText: true 
    
    }, {
        label: 'Owner Name',
        fieldName: 'Owner_Name',
        type: 'text',
        editable: false,
        sortable: "true",
    },  {
        label: 'Phone',
        fieldName: 'Phone',
        type: 'phone',
        editable: true
    },{
        label: 'Website',
        fieldName: 'Website',
        type: 'text', 
        editable: true
    },{
        label: 'Annual Revenue',
        fieldName: 'AnnualRevenue',
        type: 'text',
        editable: true,
    },
];

export default class AccountLWC extends LightningElement {
    columns = columns;
    allaccounts;
    @track accounts;
    saveDraftValues = [];

    @track sortBy;
    @track sortDirection;
    searchKey = '';
 
    @wire(getAccounts,{searchKey: '$searchKey'})
    accountData(result) {
        if(result){
            this.allaccounts = result;
            if (result.data) {
                let accParsedData=JSON.parse(JSON.stringify(result.data));
                accParsedData.forEach(acc => {
                    acc.accountLink = '/' + acc.Id;
                    if(acc.OwnerId){
                        acc.Owner_Name = acc.Owner.Name;
                    }
                });

                this.accounts = accParsedData;
                this.error = undefined;
            } else if (result.error) {
                this.error = result.error;
                this.accounts = undefined;
            }
        }
       
    };
 
    handleSave(event) {
        this.saveDraftValues = event.detail.draftValues;
        const recordInputs = this.saveDraftValues.slice().map(draft => {
            const fields = Object.assign({}, draft);
            return { fields };
        });
 
        // Updateing the records using the UiRecordAPi
        const promises = recordInputs.map(recordInput => updateRecord(recordInput));
        Promise.all(promises).then(res => {
            this.ShowToast('Success', 'Records Updated Successfully!', 'success', 'dismissable');
            this.saveDraftValues = [];
            return this.refresh();
        }).catch(error => {
            this.ShowToast('Error', 'An Error Occured!!', 'error', 'dismissable');
        }).finally(() => {
            this.saveDraftValues = [];
        });
    }
 
    ShowToast(title, message, variant, mode){
        const evt = new ShowToastEvent({
                title: title,
                message:message,
                variant: variant,
                mode: mode
            });
            this.dispatchEvent(evt);
    }
 
    // This function is used to refresh the table once data updated
    async refresh() {
        await refreshApex(this.allaccounts);
    }

    doSorting(event) {
        this.sortBy = event.detail.fieldName;
        this.sortDirection = event.detail.sortDirection;
        this.sortData(this.sortBy, this.sortDirection);
    }

    sortData(fieldname, direction) {
        let parseData = JSON.parse(JSON.stringify(this.accounts));
        // Return the value stored in the field
        let keyValue = (a) => {
            return a[fieldname];
        };
        // cheking reverse direction
        let isReverse = direction === 'asc' ? 1: -1;
        // sorting data
        parseData.sort((x, y) => {
            x = keyValue(x) ? keyValue(x) : ''; // handling null values
            y = keyValue(y) ? keyValue(y) : '';
            // sorting values based on direction
            return isReverse * ((x > y) - (y > x));
        });
        this.accounts = parseData;
    }    

    handleKeyChange( event ) {
        this.searchKey = event.target.value;
        if(this.searchKey){
            var data = [];
            for(var i=0; i<this.accounts.length;i++){
                if(this.accounts[i]!= undefined && this.accounts[i].Name.includes(this.searchKey)){
                    data.push(this.accounts[i]);
                }
            }
             if(data.length > 0){
                this.accounts = data;
            }
            else{
                this.accounts = undefined;
            }
        }
       
    }
}