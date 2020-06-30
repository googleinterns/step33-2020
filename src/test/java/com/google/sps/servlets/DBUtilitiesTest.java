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
    
    Entity originalInteraction = new Entity("Interactions");
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

    DBUtilities.setToTrue("Person1", Property.FIND_NEAREST_LOCATION);

    assertEquals(1, dataStore.prepare(new Query(DBUtilities.INTERACTION_TABLE)).countEntities(withLimit(10)));
  }

  @Test
  public void checkIfPropertyUpdatedCorrectly() {
    DatastoreService datastore = setDatabaseUp();
    
    DBUtilities.setToTrue("Person1", Property.GRANTS_LOCATION);

    final Filter correlatorFilter =  new FilterPredicate(Property.CORRELATOR, FilterOperator.EQUAL, correlator);
    final Query interactionQuery = new Query(INTERACTION_TABLE).setFilter(correlatorFilter);

    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    PreparedQuery filteredImpression = datastore.prepare(interactionQuery);

    Entity currentInteraction = filteredImpression.asSingleEntity(); 

    assertEquals(true, (boolean) currentInteraction.getProperty(Property.GRANTS_LOCATION));
  }

  @Test
  public void checkIfNothingUpdatesWhenPersonNotFound() {
    DatastoreService datastore = setDatabaseUp();
    
    DBUtilities.setToTrue("Person2", Property.GRANTS_LOCATION);

    Entity originalInteraction = new Entity("Interactions");
    originalInteraction.setProperty(Property.CORRELATOR, "Person1");
    originalInteraction.setProperty(Property.FIND_NEAREST_LOCATION, false);
    originalInteraction.setProperty(Property.GRANTS_LOCATION, false);
    originalInteraction.setProperty(Property.INTERACTS_WITH_MAP, false);
    originalInteraction.setProperty(Property.SKIP_TO_CONTENT, false);
    originalInteraction.setProperty(Property.RETURN_TO_AD, false);

    final Filter correlatorFilter =  new FilterPredicate(Property.CORRELATOR, FilterOperator.EQUAL, "Person1");
    final Query interactionQuery = new Query(INTERACTION_TABLE).setFilter(correlatorFilter);

    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    PreparedQuery filteredImpression = datastore.prepare(interactionQuery);

    Entity currentInteraction = filteredImpression.asSingleEntity(); 

    assertEquals(originalInteraction.toString(), currentInteraction.toString());
  }
}