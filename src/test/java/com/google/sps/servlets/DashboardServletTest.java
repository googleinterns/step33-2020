package com.google.sps.servlets;

import java.io.IOException;
import org.junit.Assert;
import org.junit.Before;
import org.junit.After;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import com.google.sps.servlets.DBUtilities;
import org.mockito.Mockito;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.google.appengine.tools.development.testing.LocalDatastoreServiceTestConfig;
import com.google.appengine.tools.development.testing.LocalServiceTestHelper;
import java.io.StringWriter;
import java.io.PrintWriter;
import com.google.appengine.api.datastore.Query;
import com.google.sps.servlets.Property;
import com.google.appengine.api.datastore.Query.Filter;
import com.google.appengine.api.datastore.Query.FilterPredicate;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query.CompositeFilterOperator;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;

@RunWith(JUnit4.class)
public final class DashboardServletTest {

  private final LocalServiceTestHelper helper =
      new LocalServiceTestHelper(new LocalDatastoreServiceTestConfig());
  private PrintWriter printWriter;
  private HttpServletRequest request;       
  private HttpServletResponse response; 

  @Before
  public void setUp() { 
    printWriter  = new PrintWriter(new StringWriter());
    request = Mockito.mock(HttpServletRequest.class);
    response = Mockito.mock(HttpServletResponse.class); 
    helper.setUp();
  }

  @After
  public void tearDown() {
    helper.tearDown();
  }

  @Test
  public void testCorrectStatusWhenParameterNull() throws IOException {

    // could also be 'endTime' here
    Mockito.when(request.getParameter("startTime")).thenReturn(null);
    Mockito.when(response.getWriter()).thenReturn(printWriter);

    new DashboardServlet().doGet(request, response);

    // Mockito.when(request.getWriter().println())
    Mockito.verify(response).setStatus(HttpServletResponse.SC_OK);
  }

  @Test
  public void testCorrectStatusWhenParameterEmpty() throws IOException {   

    // could also be 'endTime' here
    Mockito.when(request.getParameter("startTime")).thenReturn("");
    Mockito.when(response.getWriter()).thenReturn(printWriter);

    new DashboardServlet().doGet(request, response);

    Mockito.verify(response).setStatus(HttpServletResponse.SC_OK);
  }

  @Test
  public void testCorrectNumberReturnedOnQuery() throws IOException, IllegalAccessException {

    Mockito.when(request.getParameter("startTime")).thenReturn("0");
    Mockito.when(request.getParameter("endTime")).thenReturn("1");
    Mockito.when(response.getWriter()).thenReturn(printWriter);

    Filter startTimestampFilter =  new FilterPredicate(Property.TIMESTAMP, FilterOperator.GREATER_THAN_OR_EQUAL,request.getParameter("startTime"));
    Filter endTimestampFilter =  new FilterPredicate(Property.TIMESTAMP, FilterOperator.LESS_THAN_OR_EQUAL, request.getParameter("endTime"));
    
    Query timedQuery = new Query("Interactions").setFilter(CompositeFilterOperator.and(startTimestampFilter, endTimestampFilter));
    DatastoreService dataStore = DatastoreServiceFactory.getDatastoreService();

    Entity originalInteraction = new Entity("Interactions");
    originalInteraction.setProperty(Property.CORRELATOR, "Person1");
    originalInteraction.setProperty(Property.FIND_NEAREST_LOCATION, false);
    originalInteraction.setProperty(Property.GRANTS_LOCATION, false);
    originalInteraction.setProperty(Property.INTERACTS_WITH_MAP, false);
    originalInteraction.setProperty(Property.SKIP_TO_CONTENT, false);
    originalInteraction.setProperty(Property.RETURN_TO_AD, false);
    originalInteraction.setProperty(Property.TIMESTAMP, "1");

    dataStore.put(originalInteraction);

    new DashboardServlet().doGet(request, response);

    Assert.assertEquals(1, dataStore.prepare(timedQuery).countEntities());
  }
}