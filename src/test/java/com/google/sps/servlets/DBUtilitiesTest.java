package com.google.sps.servlets;

import org.junit.Assert;
import org.junit.Before;
import org.junit.After;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import com.google.appengine.tools.development.testing.LocalDatastoreServiceTestConfig;
import com.google.appengine.tools.development.testing.LocalServiceTestHelper;
import com.google.sps.servlets.DBUtilities;
import com.google.sps.servlets.Property;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.Filter;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query.FilterPredicate;

@RunWith(JUnit4.class)
public final class DBUtilitiesTest {

  private final LocalServiceTestHelper helper =
      new LocalServiceTestHelper(new LocalDatastoreServiceTestConfig());

  @Before
  public void setUp() {
    helper.setUp();
  }

  @After
  public void tearDown() {
    helper.tearDown();
  }

  private DatastoreService setDatabaseUp() {
    DatastoreService dataStore = DatastoreServiceFactory.getDatastoreService();
    
    Entity originalInteraction = new Entity(DBUtilities.INTERACTION_TABLE);
    originalInteraction.setProperty(Property.CORRELATOR, "Person1");
    originalInteraction.setProperty(Property.FIND_NEAREST_LOCATION, false);
    originalInteraction.setProperty(Property.GRANTS_LOCATION, false);
    originalInteraction.setProperty(Property.INTERACTS_WITH_MAP, false);
    originalInteraction.setProperty(Property.SKIP_TO_CONTENT, false);
    originalInteraction.setProperty(Property.RETURN_TO_AD, false);

    dataStore.put(originalInteraction);

    return dataStore;
  }

  @Test
  public void testIfOnlyOneEntryMade() {
    DatastoreService dataStore = setDatabaseUp();

    // a specific property used here, but any of the properties can be used
    DBUtilities.setToTrue("Person1", Property.FIND_NEAREST_LOCATION);

    Assert.assertEquals(1, dataStore.prepare(new Query(DBUtilities.INTERACTION_TABLE)).countEntities());
  }

  @Test
  public void testIfPropertyUpdatedCorrectly() {
    DatastoreService datastore = setDatabaseUp();
    
    // a specific property used here, but any of the properties can be used
    DBUtilities.setToTrue("Person1", Property.GRANTS_LOCATION);

    final Filter correlatorFilter =  new FilterPredicate(Property.CORRELATOR, FilterOperator.EQUAL, "Person1");
    final Query interactionQuery = new Query(DBUtilities.INTERACTION_TABLE).setFilter(correlatorFilter);

    DatastoreService newDatastore = DatastoreServiceFactory.getDatastoreService();
    PreparedQuery filteredImpression = newDatastore.prepare(interactionQuery);

    Entity currentInteraction = filteredImpression.asSingleEntity(); 

    Assert.assertEquals(true, (boolean) currentInteraction.getProperty(Property.GRANTS_LOCATION));
  }

  @Test
  public void testIfNothingUpdatesWhenPersonNotFound() {
    DatastoreService datastore = setDatabaseUp();
    
    // a specific property used here, but any of the properties can be used
    DBUtilities.setToTrue("Person2", Property.GRANTS_LOCATION);

    Entity originalInteraction = new Entity("Interactions");
    originalInteraction.setProperty(Property.CORRELATOR, "Person1");
    originalInteraction.setProperty(Property.FIND_NEAREST_LOCATION, false);
    originalInteraction.setProperty(Property.GRANTS_LOCATION, false);
    originalInteraction.setProperty(Property.INTERACTS_WITH_MAP, false);
    originalInteraction.setProperty(Property.SKIP_TO_CONTENT, false);
    originalInteraction.setProperty(Property.RETURN_TO_AD, false);

    final Filter correlatorFilter =  new FilterPredicate(Property.CORRELATOR, FilterOperator.EQUAL, "Person1");
    final Query interactionQuery = new Query(DBUtilities.INTERACTION_TABLE).setFilter(correlatorFilter);

    DatastoreService newDatastore = DatastoreServiceFactory.getDatastoreService();
    PreparedQuery filteredImpression = newDatastore.prepare(interactionQuery);

    Entity currentInteraction = filteredImpression.asSingleEntity(); 
    
    Assert.assertEquals(originalInteraction.getProperty(Property.CORRELATOR), currentInteraction.getProperty(Property.CORRELATOR));
    Assert.assertEquals(originalInteraction.getProperty(Property.FIND_NEAREST_LOCATION), currentInteraction.getProperty(Property.FIND_NEAREST_LOCATION));
    Assert.assertEquals(originalInteraction.getProperty(Property.GRANTS_LOCATION), currentInteraction.getProperty(Property.GRANTS_LOCATION));
    Assert.assertEquals(originalInteraction.getProperty(Property.INTERACTS_WITH_MAP), currentInteraction.getProperty(Property.INTERACTS_WITH_MAP));
    Assert.assertEquals(originalInteraction.getProperty(Property.SKIP_TO_CONTENT), currentInteraction.getProperty(Property.SKIP_TO_CONTENT));
    Assert.assertEquals(originalInteraction.getProperty(Property.RETURN_TO_AD), currentInteraction.getProperty(Property.RETURN_TO_AD));
    
    
  }
}