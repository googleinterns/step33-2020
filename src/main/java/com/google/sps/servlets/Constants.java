package com.google.sps.servlets;

public class Constants {
 
  public static final Filter correlatorFilter =  new FilterPredicate("correlator", FilterOperator.EQUAL, correlator);
  public static final Query impressionQuery = new Query("Impressions").setFilter(correlatorFilter);

  public static void updateDatabase(String propertyToUpdate) {
    
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    PreparedQuery filteredImpression = datastore.prepare(impressionQuery);

    for (Entity impression : filteredImpression.asIterable()) {
      impression.setProperty(propertyToUpdate, true);
      datastore.put(impression);  // override the existing entity
    }
  }
}