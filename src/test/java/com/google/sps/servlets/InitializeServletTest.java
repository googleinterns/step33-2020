package com.google.sps.servlets;

import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import com.google.appengine.tools.development.testing.LocalDatastoreServiceTestConfig;
import com.google.appengine.tools.development.testing.LocalServiceTestHelper;
import com.google.sps.servlets.DBUtilities;
import com.google.sps.servlets.Property;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;

@RunWith(JUnit4.class)
public final class InitializeServletTest {

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

  @Test
  public void testIfOnlyOneEntryMade() {
    HttpServletRequest request = mock(HttpServletRequest.class);       
    HttpServletResponse response = mock(HttpServletResponse.class);    

    when(request.getParameter("correlator")).thenReturn("Person1");

    new InitializeServlet().doGet(request, response);

  }

  @Test
  public void checkIfBadRequestStatusSent() {
    HttpServletRequest request = mock(HttpServletRequest.class);       
    HttpServletResponse response = mock(HttpServletResponse.class);    

    when(request.getParameter("correlator")).thenReturn(null);

    new InitializeServlet().doGet(request, response);

    assertEquals(HttpServletResponse.SC_BAD_REQUEST, response.getStatus());
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