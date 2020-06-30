package com.google.sps.servlets;

import org.junit.Assert;
import org.junit.Before;
import org.junit.After;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import com.google.sps.servlets.DBUtilities;
import org.mockito.Mockito.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.google.appengine.tools.development.testing.LocalDatastoreServiceTestConfig;
import com.google.appengine.tools.development.testing.LocalServiceTestHelper;

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
  public void testCorrectStatusSent() {
    HttpServletRequest request = mock(HttpServletRequest.class);       
    HttpServletResponse response = mock(HttpServletResponse.class);    

    when(request.getParameter("correlator")).thenReturn("Person1");

    new InitializeServlet().doGet(request, response);

    Assert.assertEquals(HttpServletResponse.SC_OK, response.getStatus());
  }

  @Test
  public void testIfBadRequestStatusSentNull() {
    HttpServletRequest request = mock(HttpServletRequest.class);       
    HttpServletResponse response = mock(HttpServletResponse.class);    

    when(request.getParameter("correlator")).thenReturn(null);

    new InitializeServlet().doGet(request, response);

    Assert.assertEquals(HttpServletResponse.SC_BAD_REQUEST, response.getStatus());
  }

  @Test
  public void testIfBadRequestStatusSentEmpty() {
    HttpServletRequest request = mock(HttpServletRequest.class);       
    HttpServletResponse response = mock(HttpServletResponse.class);    

    when(request.getParameter("correlator")).thenReturn("");

    new InitializeServlet().doGet(request, response);

    Assert.assertEquals(HttpServletResponse.SC_BAD_REQUEST, response.getStatus());
  }
}