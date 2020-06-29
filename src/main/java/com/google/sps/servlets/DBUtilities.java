package com.google.sps.servlets;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query.Filter;
import com.google.appengine.api.datastore.Query.FilterPredicate;
import com.google.appengine.api.datastore.Query.FilterOperator;

public class DBUtilities {

  public static final String INTERACTION_TABLE = "Interactions";
 
 /**
  * Given the correlator and the property to update, this will update the database to reflect that the user
  * clicked on the corresponding metric.
  *
  * @param correlator A correlator for the current user.
  * @param propertyToUpdate The property that is to be updated
  */
  public static void setToTrue(String correlator, String propertyToUpdate) {
    
    final Filter correlatorFilter =  new FilterPredicate(Property.CORRELATOR, FilterOperator.EQUAL, correlator);
    final Query interactionQuery = new Query(INTERACTION_TABLE).setFilter(correlatorFilter);

    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    PreparedQuery filteredImpression = datastore.prepare(interactionQuery);

    // throws a tooManyResultsException if more than one entry exists with same correlator
    Entity currentInteraction = filteredImpression.asSingleEntity();

    if (currentInteraction != null) {
      currentInteraction.setProperty(propertyToUpdate, true);
      datastore.put(currentInteraction);  // override the existing entity
    }
  }
}