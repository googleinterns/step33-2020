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
  public void testPercentageMethodCalledWithCorrectOrder() throws IOException, IllegalAccessException {

    Mockito.when(request.getParameter("startTime")).thenReturn("0");
    Mockito.when(request.getParameter("endTime")).thenReturn("1");
    Mockito.when(response.getWriter()).thenReturn(printWriter);

    // DashboardServlet dashboardServletObject = new DashboardServlet();
    // dashboardServletObject.doGet(request, response);

    DashboardServlet ds = Mockito.mock(DashboardServlet.class);
    ds.doGet(request, response);

    Mockito.verify(ds).calculatePercentages();
  }

  @Test
  public void testPercentageMethodWithSwappedOrder() throws IOException, IllegalAccessException {

    Mockito.when(request.getParameter("startTime")).thenReturn("1");
    Mockito.when(request.getParameter("endTime")).thenReturn("0");
    Mockito.when(response.getWriter()).thenReturn(printWriter);

    // DashboardServlet dashboardServletObject = new DashboardServlet();
    // dashboardServletObject.doGet(request, response);

    DashboardServlet ds = Mockito.mock(DashboardServlet.class);
    ds.doGet(request, response);

    Mockito.verify(ds).calculatePercentages();
  }
}