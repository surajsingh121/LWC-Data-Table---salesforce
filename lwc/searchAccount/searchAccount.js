import { LightningElement, track } from 'lwc';
import searchAccounts from '@salesforce/apex/AccountSearchController.searchAccounts';
import deleteRecord from '@salesforce/apex/AccountSearchController.deleteRecord';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';

export default class AccountSearch extends NavigationMixin(LightningElement) {
    @track searchKey = '';
    @track accounts;

    // Columns for Contacts
    contactColumns = [
        { label: 'Name', fieldName: 'Name' },
        { label: 'Email', fieldName: 'Email', type: 'email' },
        { label: 'Phone', fieldName: 'Phone', type: 'phone' },
        {
            type: 'action',
            typeAttributes: {
                rowActions: [
                    { label: 'View', name: 'view' },
                    { label: 'Edit', name: 'edit' },
                    { label: 'Delete', name: 'delete' }
                ]
            }
        }
    ];

    // Columns for Opportunities
    opportunityColumns = [
        { label: 'Name', fieldName: 'Name' },
        { label: 'Stage', fieldName: 'StageName' },
        { label: 'Amount', fieldName: 'Amount', type: 'currency' },
        { label: 'Close Date', fieldName: 'CloseDate', type: 'date' },
        {
            type: 'action',
            typeAttributes: {
                rowActions: [
                    { label: 'View', name: 'view' },
                    { label: 'Edit', name: 'edit' },
                    { label: 'Delete', name: 'delete' }
                ]
            }
        }
    ];

    handleChange(event) {
        this.searchKey = event.target.value;
    }

    handleSearch() {
        searchAccounts({ searchKey: this.searchKey })
            .then(result => {
                this.accounts = result;
                if(this.accounts == 0){
                    this.showToast('Error','so such related contact or opportunity result found', 'error');
                }
            })
            .catch(error => {
                this.showToast('Error', error.body.message, 'error');
            });
    }

    handleRowAction(event) {
        const action = event.detail.action.name;
        const row = event.detail.row;

        let sObjectType = row.Email !== undefined ? 'Contact' : 'Opportunity';

        switch (action) {
            case 'view':
                this[NavigationMixin.Navigate]({
                    type: 'standard__recordPage',
                    attributes: {
                        recordId: row.Id,
                        objectApiName: sObjectType,
                        actionName: 'view'
                    }
                });
                break;
            case 'edit':
                this[NavigationMixin.Navigate]({
                    type: 'standard__recordPage',
                    attributes: {
                        recordId: row.Id,
                        objectApiName: sObjectType,
                        actionName: 'edit'
                    }
                });
                break;
            case 'delete':
                this.deleteRow(row.Id, sObjectType);
                break;
        }
    }

    deleteRow(recordId, sObjectType) {
        deleteRecord({ recordId: recordId, sObjectName: sObjectType })
            .then(() => {
                this.showToast('Success', `${sObjectType} deleted successfully`, 'success');
                this.handleSearch(); // refresh
            })
            .catch(error => {
                this.showToast('Error deleting record', error.body.message, 'error');
            });
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        }));
    }
}