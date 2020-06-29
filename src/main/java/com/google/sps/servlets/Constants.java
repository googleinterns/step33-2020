package com.google.sps.servlets;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query.Filter;
import com.google.appengine.api.datastore.Query.FilterPredicate;
import com.google.appengine.api.datastore.Query.FilterOperator;

public class Constants {
 
  public static void updateDatabase(String correlator, String propertyToUpdate) {
    
    public static final Filter correlatorFilter =  new FilterPredicate("correlator", FilterOperator.EQUAL, correlator);
    public static final Query impressionQuery = new Query("Impressions").setFilter(correlatorFilter);

    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    PreparedQuery filteredImpression = datastore.prepare(impressionQuery);

    for (Entity impression : filteredImpression.asIterable()) {
      impression.setProperty(propertyToUpdate, true);
      datastore.put(impression);  // override the existing entity
    }
  }
}