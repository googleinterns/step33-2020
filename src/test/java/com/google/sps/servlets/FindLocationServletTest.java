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

@RunWith(JUnit4.class)
public final class FindLocationServletTest {

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
  public void testCorrectStatusSent() throws IOException {
    HttpServletRequest request = Mockito.mock(HttpServletRequest.class);       
    HttpServletResponse response = Mockito.mock(HttpServletResponse.class);    

    Mockito.when(request.getParameter("correlator")).thenReturn("Person1");

    new FindLocationServlet().doGet(request, response);

    Mockito.verify(response).setStatus(HttpServletResponse.SC_OK);
  }

  @Test
  public void testIfBadRequestStatusSentNull() throws IOException {
    HttpServletRequest request = Mockito.mock(HttpServletRequest.class);       
    HttpServletResponse response = Mockito.mock(HttpServletResponse.class);    

    Mockito.when(request.getParameter("correlator")).thenReturn(null);

    new FindLocationServlet().doGet(request, response);

    Mockito.verify(response).setStatus(HttpServletResponse.SC_BAD_REQUEST);
  }

  @Test
  public void testIfBadRequestStatusSentEmpty() throws IOException {
    HttpServletRequest request = Mockito.mock(HttpServletRequest.class);       
    HttpServletResponse response = Mockito.mock(HttpServletResponse.class);    

    Mockito.when(request.getParameter("correlator")).thenReturn("");

    new FindLocationServlet().doGet(request, response);

    Mockito.verify(response).setStatus(HttpServletResponse.SC_BAD_REQUEST);
  }
}