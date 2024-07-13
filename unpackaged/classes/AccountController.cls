public with sharing class AccountController {
    @AuraEnabled(Cacheable = true)
    public static List<Account> getAccounts(String searchKey) {

        System.debug('Search Key : '+searchKey);
        /*return [SELECT Id, Name,OwnerId,Owner.Name,phone,website,AnnualRevenue
                FROM Account 
                WHERE Industry != null
                //AND Industry = 'Financial'
                ORDER BY CreatedDate limit 5];
        */
        String strQuery = 'SELECT Id, Name,OwnerId,Owner.Name,phone,website,AnnualRevenue FROM Account WHERE Industry != null AND Industry = \'Financial Services\'';
        
        system.debug('query---'+strQuery);
        if ( searchKey != null && searchKey != '' ) {
            String key = '%' + searchKey + '%';
            strQuery += ' AND Name LIKE :key';
        }
        
        //strQuery = strQuery + ' LIMIT 5';
        return Database.query( strQuery );
    }
}